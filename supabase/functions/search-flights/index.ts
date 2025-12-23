import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SearchParams {
  origin?: string;
  destination?: string;
  departureDate?: string;
  passengers?: number;
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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');
    const departureDate = url.searchParams.get('departureDate');
    const passengers = url.searchParams.get('passengers');

    let query = supabase
      .from('flights')
      .select('*')
      .gte('available_seats', passengers || 1)
      .order('departure_time', { ascending: true });

    if (origin) {
      query = query.ilike('origin', `%${origin}%`);
    }

    if (destination) {
      query = query.ilike('destination', `%${destination}%`);
    }

    if (departureDate) {
      const startOfDay = new Date(departureDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(departureDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('departure_time', startOfDay.toISOString())
        .lte('departure_time', endOfDay.toISOString());
    }

    const { data: flights, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ flights }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});