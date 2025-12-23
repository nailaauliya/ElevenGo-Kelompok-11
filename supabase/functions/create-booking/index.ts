import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface BookingRequest {
  flightId: string;
  passengerCount: number;
  passengerDetails: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const bookingData: BookingRequest = await req.json();

    const { data: flight, error: flightError } = await supabase
      .from('flights')
      .select('*')
      .eq('id', bookingData.flightId)
      .single();

    if (flightError || !flight) {
      throw new Error('Flight not found');
    }

    if (flight.available_seats < bookingData.passengerCount) {
      throw new Error('Not enough available seats');
    }

    const totalPrice = flight.price * bookingData.passengerCount;

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        flight_id: bookingData.flightId,
        passenger_count: bookingData.passengerCount,
        total_price: totalPrice,
        booking_status: 'confirmed',
        passenger_details: bookingData.passengerDetails,
      })
      .select()
      .single();

    if (bookingError) {
      throw bookingError;
    }

    const { error: updateError } = await supabase
      .from('flights')
      .update({ available_seats: flight.available_seats - bookingData.passengerCount })
      .eq('id', bookingData.flightId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ booking, message: 'Booking created successfully' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});