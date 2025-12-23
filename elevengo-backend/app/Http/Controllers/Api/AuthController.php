<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // =========================================================================
    // 1. LOGIN MANUAL (Email & Password)
    // =========================================================================
    public function login(Request $request)
    {
        // Validasi input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Cek user berdasarkan email
        $user = User::where('email', $request->email)->first();

        // Cek password manual
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        // Buat Token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login success',
            'token' => $token,
            'user' => $user
        ]);
    }

    // =========================================================================
    // 2. GOOGLE LOGIN (BARU)
    // =========================================================================
    public function googleLogin(Request $request)
    {
        // 1. Validasi input yang dikirim dari React
        $request->validate([
            'email' => 'required|email',
            'name' => 'required', // Nama dari Google
            'google_uid' => 'required', // ID unik dari Google
        ]);

        // 2. Cari apakah user dengan email ini sudah ada?
        $user = User::where('email', $request->email)->first();

        if ($user) {
            // === KASUS A: USER SUDAH ADA ===
            // Jika user lama login pakai Google, kita update UID-nya biar terhubung
            
            // Siapkan data yang mau diupdate
            $updateData = [];
            
            // Jika google_uid belum tersimpan, simpan sekarang
            if (!$user->google_uid) {
                $updateData['google_uid'] = $request->google_uid;
            }
            
            // Jika foto profil user masih kosong/default, pakai foto dari Google
            if (empty($user->photo_url) && $request->photo_url) {
                $updateData['photo_url'] = $request->photo_url;
            }

            // Lakukan update jika ada data yang berubah
            if (!empty($updateData)) {
                $user->update($updateData);
            }

        } else {
            // === KASUS B: USER BARU ===
            // Buat user baru di database otomatis
            $user = User::create([
                'full_name' => $request->name, // Mapping 'name' Google ke 'full_name' database
                'email' => $request->email,
                'google_uid' => $request->google_uid,
                'photo_url' => $request->photo_url,
                'password' => null, // Password kosong karena login via Google
                'role' => 'user',
                'wallet_balance' => 0,
                // Data default profil (bisa diubah user nanti)
                'gender' => 'Male', 
                'citizenship' => 'Indonesia',
                'birth_date' => '2000-01-01',
            ]);
        }

        // 3. BUAT TOKEN (PENTING)
        // Kita wajib buat token agar React dianggap "Sedang Login"
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login Google berhasil',
            'token' => $token, // Token ini disimpan di React (localStorage/Cookies)
            'user' => $user
        ]);
    }

    // =========================================================================
    // 3. REGISTER MANUAL
    // =========================================================================
    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'wallet_balance' => 0,
            'role' => 'user',
            // Default data agar tidak error
            'gender' => 'Male',
            'citizenship' => 'Indonesia',
            'birth_date' => '2000-01-01',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    // =========================================================================
    // 4. LOGOUT
    // =========================================================================
    public function logout(Request $request)
    {
        // Hapus token yang sedang dipakai saat ini
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    // =========================================================================
    // 5. GET USER PROFILE
    // =========================================================================
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
    
    // =========================================================================
    // 6. UPDATE PROFILE
    // =========================================================================
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        // Hanya update field yang diizinkan
        $user->update($request->only([
            'full_name', 'phone', 'gender', 'citizenship', 'birth_date'
        ]));

        return response()->json(['message' => 'Profile updated', 'user' => $user]);
    }
}