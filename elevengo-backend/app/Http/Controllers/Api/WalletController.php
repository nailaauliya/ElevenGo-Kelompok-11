<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Transaction; // <--- WAJIB ADA! Kalau hilang = Error 500

class WalletController extends Controller
{
    public function topup(Request $request)
    {
        try {
            // 1. Validasi
            $request->validate(['amount' => 'required|numeric|min:10000']);
            
            $user = Auth::user();
            
            // 2. Tambah Saldo
            $user->wallet_balance += $request->amount;
            $user->save();
            // <--- Kalau ini error, berarti kolom wallet_balance tidak ada di tabel users

            // 3. Catat Transaksi
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'title'   => 'Top Up Balance',
                'amount'  => $request->amount,
                'type'    => 'income'
            ]); // <--- Kalau ini error, berarti tabel transactions belum ada atau Model belum di-guarded

            return response()->json([
                'message' => 'Top up successful',
                'balance' => $user->wallet_balance,
                'transaction' => $transaction
            ]);

        } catch (\Exception $e) {
            // Tampilkan pesan error asli agar kita tahu salahnya dimana
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    public function history()
    {
        try {
            $transactions = Transaction::where('user_id', Auth::id())
                ->latest()
                ->get();
                
            return response()->json($transactions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
}