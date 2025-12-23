<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Reset Table (Agar tidak duplikat saat di-run ulang)
        // Urutan delete penting karena Foreign Key
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('notifications')->truncate();
        DB::table('payments')->truncate();
        DB::table('saved_cards')->truncate();
        DB::table('bookings')->truncate();
        DB::table('flights')->truncate();
        DB::table('airlines')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Insert Users
        DB::table('users')->insert([
            [
                'id' => 1,
                'full_name' => 'Lee Jeno',
                'email' => 'jeno@gmail.com',
                'password' => Hash::make('password123'),
                'phone' => '08123456789',
                'gender' => 'Male',
                'citizenship' => 'Indonesia',
                'birth_date' => '2000-04-23',
                'wallet_balance' => 2500000.00,
                'photo_url' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
                'role' => 'user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'full_name' => 'Admin ElevenGo',
                'email' => 'admin@elevengo.com',
                'password' => Hash::make('admin123'),
                'phone' => '081298765432',
                'gender' => 'Male',
                'citizenship' => 'Indonesia',
                'birth_date' => '1995-01-01',
                'wallet_balance' => 0,
                'photo_url' => null,
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // 3. Insert Airlines
        DB::table('airlines')->insert([
            ['id' => 1, 'code' => 'GA', 'name' => 'Garuda Indonesia', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Garuda_Indonesia_Logo.svg/1200px-Garuda_Indonesia_Logo.svg.png'],
            ['id' => 2, 'code' => 'QZ', 'name' => 'AirAsia Indonesia', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/AirAsia_New_Logo.svg/1200px-AirAsia_New_Logo.svg.png'],
            ['id' => 3, 'code' => 'JT', 'name' => 'Lion Air', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Lion_Air_logo.svg/1200px-Lion_Air_logo.svg.png'],
            ['id' => 4, 'code' => 'ID', 'name' => 'Batik Air', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Batik_Air_logo.svg/1200px-Batik_Air_logo.svg.png'],
            ['id' => 5, 'code' => 'QG', 'name' => 'Citilink', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Citilink_logo.svg/1200px-Citilink_logo.svg.png'],
            ['id' => 6, 'code' => 'IW', 'name' => 'Wings Air', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Wings_Air_logo.svg/1200px-Wings_Air_logo.svg.png'],
            ['id' => 7, 'code' => 'SQ', 'name' => 'Singapore Airlines', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/1200px-Singapore_Airlines_Logo_2.svg.png'],
            ['id' => 8, 'code' => 'EK', 'name' => 'Emirates', 'logo_url' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1200px-Emirates_logo.svg.png'],
        ]);

        // 4. Insert Flights
        // Menggunakan Carbon untuk tanggal dinamis (selalu masa depan)
        $now = Carbon::now();

        DB::table('flights')->insert([
            // Jakarta -> Bali
            [
                'airline_id' => 1, 'flight_number' => 'GA-402', 'origin' => 'Jakarta', 'origin_code' => 'CGK', 'destination' => 'Bali', 'destination_code' => 'DPS',
                'departure_time' => $now->copy()->addDays(2), 'arrival_time' => $now->copy()->addDays(2)->addHours(2),
                'price' => 5870000.00, 'available_seats' => 50, 'description' => 'Full Service'
            ],
            [
                'airline_id' => 2, 'flight_number' => 'QZ-751', 'origin' => 'Jakarta', 'origin_code' => 'CGK', 'destination' => 'Bali', 'destination_code' => 'DPS',
                'departure_time' => $now->copy()->addDays(2)->addHours(3), 'arrival_time' => $now->copy()->addDays(2)->addHours(5),
                'price' => 950000.00, 'available_seats' => 120, 'description' => 'Low Cost'
            ],
            // Surabaya -> Jakarta
            [
                'airline_id' => 3, 'flight_number' => 'JT-590', 'origin' => 'Surabaya', 'origin_code' => 'SUB', 'destination' => 'Jakarta', 'destination_code' => 'CGK',
                'departure_time' => $now->copy()->addDays(3), 'arrival_time' => $now->copy()->addDays(3)->addHours(1)->addMinutes(30),
                'price' => 850000.00, 'available_seats' => 150, 'description' => 'Economy'
            ],
            // Jakarta -> Tasikmalaya
            [
                'airline_id' => 6, 'flight_number' => 'IW-172', 'origin' => 'Jakarta', 'origin_code' => 'CGK', 'destination' => 'Tasikmalaya', 'destination_code' => 'YUI',
                'departure_time' => $now->copy()->addDays(4), 'arrival_time' => $now->copy()->addDays(4)->addMinutes(45),
                'price' => 750000.00, 'available_seats' => 30, 'description' => 'ATR 72 Propeller'
            ],
            // Internasional: Jakarta -> London
            [
                'airline_id' => 7, 'flight_number' => 'SQ-950', 'origin' => 'Jakarta', 'origin_code' => 'CGK', 'destination' => 'London', 'destination_code' => 'LHR',
                'departure_time' => $now->copy()->addDays(10), 'arrival_time' => $now->copy()->addDays(10)->addHours(14),
                'price' => 9450000.00, 'available_seats' => 30, 'description' => 'Transit SG'
            ],
            // Internasional: Jakarta -> Jepang
            [
                'airline_id' => 8, 'flight_number' => 'EK-308', 'origin' => 'Jakarta', 'origin_code' => 'CGK', 'destination' => 'Jepang', 'destination_code' => 'HND',
                'departure_time' => $now->copy()->addDays(12), 'arrival_time' => $now->copy()->addDays(12)->addHours(7),
                'price' => 9450000.00, 'available_seats' => 25, 'description' => 'Direct'
            ]
        ]);

        // 5. Insert Saved Cards
        DB::table('saved_cards')->insert([
            ['user_id' => 1, 'card_holder_name' => 'LEE JENO', 'card_number_masked' => '•••• 5174', 'card_type' => 'Visa', 'expiry_date' => '01/26', 'created_at' => now()],
            ['user_id' => 1, 'card_holder_name' => 'LEE JENO', 'card_number_masked' => '•••• 3333', 'card_type' => 'Mastercard', 'expiry_date' => '05/25', 'created_at' => now()]
        ]);

        // 6. Insert Bookings & Notifications
        // a. Booking Sukses (Bali)
        $flightBali = DB::table('flights')->where('destination_code', 'DPS')->first();
        DB::table('bookings')->insert([
            'user_id' => 1, 'flight_id' => $flightBali->id, 'booking_code' => 'ELE-JKT-DPS',
            'total_passengers' => 1, 'total_price' => $flightBali->price, 'status' => 'confirmed',
            'payment_method' => 'Visa', 'payment_status' => 'paid', 'created_at' => now()
        ]);
        DB::table('notifications')->insert([
            'user_id' => 1, 'title' => 'Booking Confirmed', 'message' => 'Your flight to Bali has been confirmed.', 'type' => 'success', 'created_at' => now()
        ]);

        // b. Booking Pending (London)
        $flightLondon = DB::table('flights')->where('destination_code', 'LHR')->first();
        DB::table('bookings')->insert([
            'user_id' => 1, 'flight_id' => $flightLondon->id, 'booking_code' => 'ELE-JKT-LHR',
            'total_passengers' => 1, 'total_price' => $flightLondon->price, 'status' => 'pending',
            'payment_method' => 'Wallet', 'payment_status' => 'unpaid', 'created_at' => $now->copy()->subHours(2)
        ]);
        DB::table('notifications')->insert([
            'user_id' => 1, 'title' => 'Payment Reminder', 'message' => 'Please pay for your London flight.', 'type' => 'warning', 'created_at' => $now->copy()->subHours(1)
        ]);
    }
}