<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Transaction; // <--- WAJIB: Import Model Transaction
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with('flight')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    // POST: Simpan Booking Baru & Potong Saldo
    public function store(Request $request)
    {
        try {
            // 1. Validasi
            $request->validate([
                'flight_id'      => 'required|exists:flights,id',
                'total_price'    => 'required|numeric',
                'payment_method' => 'nullable|string',
                'seat_number'    => 'nullable|string',
                'status'         => 'nullable|string',
            ]);

            $user = Auth::user();
            $totalPrice = $request->total_price;
            $paymentMethod = $request->payment_method ?? 'Credit Card';

            // --- [LOGIKA BARU] CEK PEMBAYARAN VIA WALLET ---
            if ($paymentMethod === 'wallet') {
                
                // Cek Saldo Cukup atau Tidak
                if ($user->wallet_balance < $totalPrice) {
                    return response()->json([
                        'message' => 'Saldo Wallet tidak mencukupi untuk transaksi ini.'
                    ], 400); // Return error 400 Bad Request
                }

                // A. Potong Saldo User
                $user->decrement('wallet_balance', $totalPrice);

                // B. Catat di Riwayat Transaksi (Agar muncul di halaman Wallet)
                Transaction::create([
                    'user_id' => $user->id,
                    'title'   => 'Flight Booking', // Judul yang muncul di frontend
                    'amount'  => $totalPrice,
                    'type'    => 'expense' // Menandakan pengeluaran (warna merah)
                ]);
            }
            // -----------------------------------------------

            // 2. Buat Kode Booking Unik
            $bookingCode = 'INV-' . strtoupper(Str::random(6));

            // 3. Simpan Data Booking
            $booking = Booking::create([
                'user_id'          => $user->id,
                'flight_id'        => $request->flight_id,
                'booking_code'     => $bookingCode,
                'total_passengers' => $request->passenger_count ?? 1,
                'total_price'      => $totalPrice,
                'payment_method'   => $paymentMethod,
                'seat_number'      => $request->seat_number,
                'status'           => 'confirmed',
            ]);

            return response()->json([
                'message' => 'Booking successful',
                'data'    => $booking
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Data tidak valid', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
}