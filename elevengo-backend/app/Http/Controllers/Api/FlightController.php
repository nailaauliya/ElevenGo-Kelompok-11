<?php

namespace App\Http\Controllers\Api; // <--- NAMESPACE DISESUAIKAN

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FlightController extends Controller
{
    public function index(Request $request)
    {
        $query = Flight::query();

        // 1. Filter Origin
        if ($request->has('origin') && $request->origin != '') {
            $query->where(function($q) use ($request) {
                $q->where('origin_code', $request->origin)
                  ->orWhere('origin', 'LIKE', '%' . $request->origin . '%');
            });
        }

        // 2. Filter Destination
        if ($request->has('destination') && $request->destination != '') {
            $query->where(function($q) use ($request) {
                $q->where('destination_code', $request->destination)
                  ->orWhere('destination', 'LIKE', '%' . $request->destination . '%');
            });
        }

        // 3. Filter Date
        if ($request->has('date') && $request->date != '') {
            try {
                $date = Carbon::parse($request->date)->format('Y-m-d');
                $query->whereDate('departure_time', $date);
            } catch (\Exception $e) {
            }
        }

        $flights = $query->orderBy('departure_time', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $flights
        ]);
    }
}