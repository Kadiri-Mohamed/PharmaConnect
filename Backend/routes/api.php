<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\RareMedicineRequestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public endpoints (no authentication required)
Route::prefix('public')->middleware('rate.limit:public,100,1')->group(function () {
    // Pharmacy endpoints
    Route::get('pharmacies', [PublicController::class, 'pharmacies']);
    Route::get('pharmacies/on-duty', [PublicController::class, 'pharmaciesOnDuty']);
    Route::get('pharmacies/{id}', [PublicController::class, 'pharmacy']);

    // Medicine endpoints
    Route::get('medicines', [PublicController::class, 'medicines']);
    Route::get('medicines/search', [PublicController::class, 'searchMedicines']);
    Route::get('medicines/{id}/availability', [PublicController::class, 'checkAvailability']);
    Route::get('pharmacies/{pharmacyId}/medicines', [PublicController::class, 'medicinesByPharmacy']);
});

// Rare medicine requests (public creation, authenticated viewing)
Route::post('rare-medicine-requests', [RareMedicineRequestController::class, 'store'])
    ->middleware('rate.limit:public,10,1');

Route::post('signUp', [AuthController::class, 'signUp'])->middleware('rate.limit:auth,5,1');
Route::post('signIn', [AuthController::class, 'signIn'])->middleware('rate.limit:auth,5,1');
Route::post('refresh', [AuthController::class, 'refresh'])->middleware('rate.limit:auth,10,1');
Route::middleware('auth:api')->group(function () {

    Route::post('signOut', [AuthController::class, 'signOut']);
    Route::get('me', [AuthController::class, 'me']);

    Route::put('updateProfile', [ProfileController::class, 'updateProfile']);
    Route::get('showProfile', [ProfileController::class, 'showProfile']);
    Route::put('updatePassword', [ProfileController::class, 'updatePassword']);
    Route::delete('deleteProfile', [ProfileController::class, 'deleteProfile']);

    // Rare medicine requests (authenticated users)
    Route::get('rare-medicine-requests/my-requests', [RareMedicineRequestController::class, 'myRequests']);

    // Cart operations (ownership enforced)
    Route::prefix('cart')->middleware('ownership:cart')->group(function () {
        Route::get('/', [\App\Http\Controllers\CartController::class, 'show']);
        Route::post('add', [\App\Http\Controllers\CartController::class, 'addItem']);
        Route::put('items/{itemId}', [\App\Http\Controllers\CartController::class, 'updateItem']);
        Route::delete('items/{itemId}', [\App\Http\Controllers\CartController::class, 'removeItem']);
        Route::delete('/', [\App\Http\Controllers\CartController::class, 'clear']);
        Route::get('total', [\App\Http\Controllers\CartController::class, 'total']);
        Route::get('validate-stock', [\App\Http\Controllers\CartController::class, 'validateStock']);
        Route::get('summary', [\App\Http\Controllers\CartController::class, 'summary']);
    });

    // Order operations (ownership enforced)
    Route::prefix('orders')->group(function () {
        Route::post('/', [\App\Http\Controllers\OrderController::class, 'store']);
        Route::get('/', [\App\Http\Controllers\OrderController::class, 'index']);
        Route::get('/{orderId}', [\App\Http\Controllers\OrderController::class, 'show'])->middleware('ownership:order');
        Route::post('/{orderId}/cancel', [\App\Http\Controllers\OrderController::class, 'cancel'])->middleware('ownership:order');
    });

    Route::middleware('role:pharmacist')->group(function () {
        Route::get('dashboard/pharmacy', function () {
            return response()->json(['message' => 'Welcome to the pharmacist dashboard']);
        });

        Route::get('pharmacy', [\App\Http\Controllers\PharmacyController::class, 'show']);
        Route::post('pharmacy', [\App\Http\Controllers\PharmacyController::class, 'store']);
        Route::put('pharmacy', [\App\Http\Controllers\PharmacyController::class, 'update']);

        // Medicine management (ownership enforced)
        Route::apiResource('medicines', \App\Http\Controllers\MedicineController::class)->middleware('ownership:pharmacy');

        // Order management for pharmacists
        Route::put('orders/{orderId}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus']);
        Route::get('orders/pharmacy', [\App\Http\Controllers\OrderController::class, 'pharmacyOrders']);
        Route::get('orders/pharmacy/statistics', [\App\Http\Controllers\OrderController::class, 'pharmacyStatistics']);

        // Rare medicine requests (pharmacist only)
        Route::get('rare-medicine-requests', [RareMedicineRequestController::class, 'index']);
        Route::get('rare-medicine-requests/{id}', [RareMedicineRequestController::class, 'show']);
        Route::put('rare-medicine-requests/{id}/status', [RareMedicineRequestController::class, 'updateStatus']);
        Route::get('rare-medicine-requests/statistics', [RareMedicineRequestController::class, 'statistics']);
    });

    Route::middleware('role:client')->get('dashboard/client', function () {
        return response()->json(['message' => 'Welcome to the client dashboard']);
    });

});



