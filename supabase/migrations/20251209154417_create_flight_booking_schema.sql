/*
  # Flight Booking System Schema

  ## Overview
  Creates the complete database schema for a flight booking application including
  flights, bookings, and user profiles with proper security policies.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `phone` (text) - Contact number
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `flights`
  - `id` (uuid, primary key) - Unique flight identifier
  - `flight_number` (text) - Flight number (e.g., "GA123")
  - `airline` (text) - Airline name
  - `origin` (text) - Departure city
  - `destination` (text) - Arrival city
  - `departure_time` (timestamptz) - Scheduled departure
  - `arrival_time` (timestamptz) - Scheduled arrival
  - `price` (numeric) - Ticket price
  - `available_seats` (integer) - Remaining seats
  - `total_seats` (integer) - Total capacity
  - `image_url` (text) - Destination image
  - `created_at` (timestamptz) - Record creation timestamp

  ### `bookings`
  - `id` (uuid, primary key) - Unique booking identifier
  - `user_id` (uuid, foreign key) - References profiles
  - `flight_id` (uuid, foreign key) - References flights
  - `passenger_count` (integer) - Number of passengers
  - `total_price` (numeric) - Total booking cost
  - `booking_status` (text) - Status: 'confirmed', 'cancelled', 'pending'
  - `booking_date` (timestamptz) - When booking was made
  - `passenger_details` (jsonb) - Array of passenger information
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on all tables
  - Users can read their own profile and update it
  - All users can read available flights
  - Users can create their own bookings and view their bookings only
  - Booking modifications restricted to booking owner
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number text UNIQUE NOT NULL,
  airline text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  price numeric(10, 2) NOT NULL,
  available_seats integer NOT NULL DEFAULT 0,
  total_seats integer NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  flight_id uuid REFERENCES flights(id) ON DELETE CASCADE NOT NULL,
  passenger_count integer NOT NULL DEFAULT 1,
  total_price numeric(10, 2) NOT NULL,
  booking_status text DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'pending')),
  booking_date timestamptz DEFAULT now(),
  passenger_details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for flights
CREATE POLICY "Anyone can view available flights"
  ON flights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view flights"
  ON flights FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flights_origin ON flights(origin);
CREATE INDEX IF NOT EXISTS idx_flights_destination ON flights(destination);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings(flight_id);

-- Insert sample flight data
INSERT INTO flights (flight_number, airline, origin, destination, departure_time, arrival_time, price, available_seats, total_seats, image_url)
VALUES
  ('GA101', 'ElevenGo', 'Jakarta', 'Bali', now() + interval '2 days', now() + interval '2 days 2 hours', 1450000, 150, 180, 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg'),
  ('GA102', 'ElevenGo', 'Jakarta', 'Surabaya', now() + interval '1 day', now() + interval '1 day 1.5 hours', 890000, 120, 180, 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg'),
  ('GA103', 'ElevenGo', 'Jakarta', 'Bandung', now() + interval '3 days', now() + interval '3 days 1 hour', 650000, 100, 150, 'https://images.pexels.com/photos/2372978/pexels-photo-2372978.jpeg'),
  ('GA104', 'ElevenGo', 'Bali', 'Jakarta', now() + interval '4 days', now() + interval '4 days 2 hours', 1570000, 140, 180, 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg'),
  ('GA105', 'ElevenGo', 'Surabaya', 'Bali', now() + interval '2 days', now() + interval '2 days 1.5 hours', 1100000, 90, 150, 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg'),
  ('GA106', 'ElevenGo', 'Bandung', 'Bali', now() + interval '5 days', now() + interval '5 days 2.5 hours', 1350000, 110, 150, 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg'),
  ('GA107', 'ElevenGo', 'Jakarta', 'Yogyakarta', now() + interval '1 day', now() + interval '1 day 1 hour', 750000, 130, 150, 'https://images.pexels.com/photos/2373201/pexels-photo-2373201.jpeg'),
  ('GA108', 'ElevenGo', 'Jakarta', 'Malang', now() + interval '3 days', now() + interval '3 days 1.5 hours', 950000, 80, 120, 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg')
ON CONFLICT (flight_number) DO NOTHING;