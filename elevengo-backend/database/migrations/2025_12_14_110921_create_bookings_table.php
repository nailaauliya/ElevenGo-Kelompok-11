<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('flight_id')->constrained()->onDelete('cascade');
            $table->string('booking_code')->unique();
            
            // Kolom Data
            $table->integer('total_passengers')->default(1); 
            $table->decimal('total_price', 15, 2);
            $table->string('payment_method')->nullable();
            $table->string('status')->default('confirmed'); 
            $table->string('seat_number')->nullable();       
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};