export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flights: {
        Row: {
          id: string;
          flight_number: string;
          airline: string;
          origin: string;
          destination: string;
          departure_time: string;
          arrival_time: string;
          price: number;
          available_seats: number;
          total_seats: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          flight_number: string;
          airline: string;
          origin: string;
          destination: string;
          departure_time: string;
          arrival_time: string;
          price: number;
          available_seats?: number;
          total_seats: number;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          flight_number?: string;
          airline?: string;
          origin?: string;
          destination?: string;
          departure_time?: string;
          arrival_time?: string;
          price?: number;
          available_seats?: number;
          total_seats?: number;
          image_url?: string | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          flight_id: string;
          passenger_count: number;
          total_price: number;
          booking_status: string;
          booking_date: string;
          passenger_details: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          flight_id: string;
          passenger_count?: number;
          total_price: number;
          booking_status?: string;
          booking_date?: string;
          passenger_details?: unknown;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          flight_id?: string;
          passenger_count?: number;
          total_price?: number;
          booking_status?: string;
          booking_date?: string;
          passenger_details?: unknown;
          created_at?: string;
        };
      };
    };
  };
}

export type Flight = Database['public']['Tables']['flights']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface PassengerDetail {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}
