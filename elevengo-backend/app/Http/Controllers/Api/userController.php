<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    // Get User Profile
    public function getUser(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'full_name'   => 'nullable|string',
            'phone'       => 'nullable|string',
            'gender'      => 'nullable|string',
            'citizenship' => 'nullable|string',
            'birth_date'  => 'nullable|string',
            'photo'       => 'nullable|image|mimes:jpeg,png,jpg,gif|max:20480', // Max 2MB
        ]);

        $data = $request->only([
            'full_name', 
            'phone', 
            'gender', 
            'citizenship', 
            'birth_date'
        ]);

        if ($request->hasFile('photo')) {
            if ($user->photo_url && Storage::disk('public')->exists($user->photo_url)) {
                Storage::disk('public')->delete($user->photo_url);
            }

            
            $path = $request->file('photo')->store('photos', 'public');
            
            $data['photo_url'] = $path;
        }

      
        /** @var \App\Models\User $user */
        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}