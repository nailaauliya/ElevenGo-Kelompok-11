<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\SavedCardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalletController;


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/flights', [FlightController::class, 'index']); 
Route::post('/google-login', [AuthController::class, 'googleLogin']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [UserController::class, 'getUser']);
    Route::post('/user/update', [UserController::class, 'update']);
    Route::get('/bookings', [BookingController::class, 'index']); 
    Route::post('/bookings', [BookingController::class, 'store']); 
    Route::get('/saved-cards', [SavedCardController::class, 'index']);
    Route::post('/saved-cards', [SavedCardController::class, 'store']);
    Route::delete('/saved-cards/{id}', [SavedCardController::class, 'destroy']); 
    Route::post('/wallet/topup', [WalletController::class, 'topup']);
    Route::get('/wallet/history', [WalletController::class, 'history']);
});
