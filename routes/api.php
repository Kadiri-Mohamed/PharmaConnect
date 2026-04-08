<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CartController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\RareRequestController;


/*
|--------------------------------------------------------------------------
| Public Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Pharmacy Routes
Route::get('/pharmacies', [PharmacyController::class, 'index'])->name('api.pharmacies.index');
Route::get('/pharmacies/{pharmacy}', [PharmacyController::class, 'show'])->name('api.pharmacies.show');
Route::get('/pharmacies/{pharmacy}/medicaments', [MedicamentController::class, 'getByPharmacy'])->name('api.pharmacies.medicaments');

// Medicament Routes
Route::get('/medicaments', [MedicamentController::class, 'index'])->name('api.medicaments.index');
Route::get('/medicaments/{medicament}', [MedicamentController::class, 'show'])->name('api.medicaments.show');
Route::get('/medicaments/search', [MedicamentController::class, 'search'])->name('api.medicaments.search');

// Rare Request Routes (Public Creation)
Route::post('/rare-requests', [RareRequestController::class, 'store'])->name('api.rare-requests.store');

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Client & Pharmacien)
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Cart Routes (Client)
    |--------------------------------------------------------------------------
    */
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('api.cart.index');
        Route::post('/', [CartController::class, 'store'])->name('api.cart.store');
        Route::put('/{cartItem}', [CartController::class, 'update'])->name('api.cart.update');
        Route::delete('/{cartItem}', [CartController::class, 'destroy'])->name('api.cart.destroy');
        Route::delete('/', [CartController::class, 'clear'])->name('api.cart.clear');
    });

    /*
    |--------------------------------------------------------------------------
    | Order Routes (Client)
    |--------------------------------------------------------------------------
    */
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('api.orders.index');
        Route::post('/', [OrderController::class, 'store'])->name('api.orders.store');
        Route::get('/{order}', [OrderController::class, 'show'])->name('api.orders.show');
        Route::patch('/{order}/status', [OrderController::class, 'updateStatus'])->name('api.orders.update-status');
    });

    /*
    |--------------------------------------------------------------------------
    | Rare Request Routes (Client - View Own)
    |--------------------------------------------------------------------------
    */
    Route::get('/rare-requests', [RareRequestController::class, 'index'])->name('api.rare-requests.index');

    /*
    |--------------------------------------------------------------------------
    | Pharmacien Routes (Pharmacist Only)
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:pharmacien')->prefix('pharmacien')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Pharmacy Management Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('pharmacy')->group(function () {
            Route::get('/', [PharmacyController::class, 'myPharmacy'])->name('api.pharmacien.pharmacy.show');
            Route::put('/', [PharmacyController::class, 'updateMyPharmacy'])->name('api.pharmacien.pharmacy.update');
        });

        /*
        |--------------------------------------------------------------------------
        | Medicament Management Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('medicaments')->group(function () {
            Route::get('/', [MedicamentController::class, 'pharmacienIndex'])->name('api.pharmacien.medicaments.index');
            Route::post('/', [MedicamentController::class, 'store'])->name('api.pharmacien.medicaments.store');
            Route::put('/{medicament}', [MedicamentController::class, 'update'])->name('api.pharmacien.medicaments.update');
            Route::delete('/{medicament}', [MedicamentController::class, 'destroy'])->name('api.pharmacien.medicaments.destroy');
        });

        /*
        |--------------------------------------------------------------------------
        | Order Management Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'pharmacienOrders'])->name('api.pharmacien.orders.index');
            Route::patch('/{order}/status', [OrderController::class, 'updateOrderStatus'])->name('api.pharmacien.orders.update-status');
        });

        /*
        |--------------------------------------------------------------------------
        | Rare Request Management Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('rare-requests')->group(function () {
            Route::patch('/{rareRequest}/status', [RareRequestController::class, 'updateStatus'])->name('api.pharmacien.rare-requests.update-status');
        });

    });

});
