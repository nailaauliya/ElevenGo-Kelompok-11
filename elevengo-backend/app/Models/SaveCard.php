<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavedCardController extends Controller
{
    // 1. GET ALL CARDS (List Kartu)
    public function index()
    {
        $cards = SavedCard::where('user_id', Auth::id())->get();
        // Mapping data agar sesuai dengan format React kita
        $formatted = $cards->map(function($card) {
            return [
                'id' => $card->id,
                'type' => $card->card_type,
                'number' => $card->card_number_masked,
                'holder' => $card->card_holder_name,
                'expiry' => $card->expiry_date
            ];
        });
        return response()->json($formatted);
    }

    // 2. STORE CARD (Tambah Kartu Baru)
    public function store(Request $request)
    {
        $request->validate([
            'card_holder_name' => 'required',
            'card_number_masked' => 'required',
            'card_type' => 'required',
            'expiry_date' => 'required'
        ]);

        $card = SavedCard::create([
            'user_id' => Auth::id(),
            'card_holder_name' => $request->card_holder_name,
            'card_number_masked' => $request->card_number_masked,
            'card_type' => $request->card_type,
            'expiry_date' => $request->expiry_date,
        ]);

        return response()->json(['message' => 'Card saved', 'data' => $card], 201);
    }

    // 3. DESTROY CARD (Hapus Kartu)
    public function destroy($id)
    {
        // Cari kartu milik user yang sedang login
        $card = SavedCard::where('id', $id)->where('user_id', Auth::id())->first();

        if ($card) {
            $card->delete();
            return response()->json(['message' => 'Card deleted successfully']);
        }

        return response()->json(['message' => 'Card not found or access denied'], 404);
    }
}