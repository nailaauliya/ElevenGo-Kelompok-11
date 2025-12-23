<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    // INI PENTING! Agar kita bisa insert data secara massal
    protected $guarded = []; 

    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }
}