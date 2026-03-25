<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('signUp', [AuthController::class, 'signUp']);
Route::post('signIn', [AuthController::class, 'signIn']);
Route::middleware('auth:api')->group(function () {

    Route::post('signOut', [AuthController::class, 'signOut']);
    Route::put('updateProfile', [ProfileController::class, 'updateProfile']);
    Route::get('showProfile', [ProfileController::class, 'showProfile']);
    Route::put('updatePassword', [ProfileController::class, 'updatePassword']);
    Route::delete('deleteProfile', [ProfileController::class, 'deleteProfile']);

    Route::middleware('role:pharmacist')->get('dashboard/pharmacy', function () {
        return response()->json(['message' => 'Welcome to the pharmacist dashboard']);
    });

    Route::middleware('role:client')->get('dashboard/client', function () {
        return response()->json(['message' => 'Welcome to the client dashboard']);
    });

});



