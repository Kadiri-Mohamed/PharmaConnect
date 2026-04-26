<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PharmacyController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\RareRequestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public routes
Route::get('/', fn() => Inertia::render('welcome'))->name('home');
Route::get('/medicaments', [MedicamentController::class, 'index'])->name('medicaments');
Route::get('/pharmacies', [PharmacyController::class, 'index'])->name('pharmacies');
Route::get('/pharmacies/{pharmacy}', [PharmacyController::class, 'show'])->name('pharmacy.details');

// Auth routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/prescriptions/{prescription}/file', [PrescriptionController::class, 'file'])->name('prescriptions.file');

    // Client routes
    Route::middleware(['role:client'])->group(function () {
        // Cart
        Route::get('/cart', [CartController::class, 'index'])->name('cart');
        Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
        Route::put('/cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
        Route::delete('/cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');
        Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');

        // Orders
        Route::get('/orders', [OrderController::class, 'index'])->name('orders');
        Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');

        // Prescriptions
        Route::post('/prescriptions', [PrescriptionController::class, 'store'])->name('prescriptions.store');

        // Rare requests
        Route::get('/rare-requests', [RareRequestController::class, 'index'])->name('rare-requests');
    });

    Route::middleware(['role:pharmacien'])->group(function () {
        Route::get('/create-pharmacy', [PharmacyController::class, 'create'])->name('pharmacy.create');
        Route::post('/pharmacy', [PharmacyController::class, 'store'])->name('pharmacy.store');
    });

    Route::middleware(['role:pharmacien', 'pharmacy.exists'])->group(function () {
        // Dashboard
        Route::get('/pharmacien/dashboard', [DashboardController::class, 'pharmacien'])->name('pharmacien.dashboard');
        Route::get('/my-pharmacy', [PharmacyController::class, 'myPharmacy'])->name('pharmacien.my-pharmacy');
        Route::patch('/my-pharmacy', [PharmacyController::class, 'updateMyPharmacy'])->name('pharmacien.my-pharmacy.update');

        // Medicament management
        Route::get('/pharmacien/medicaments', [MedicamentController::class, 'pharmacienIndex'])->name('pharmacien.medicaments');
        Route::post('/pharmacien/medicaments', [MedicamentController::class, 'store'])->name('pharmacien.medicaments.store');
        Route::put('/pharmacien/medicaments/{medicament}', [MedicamentController::class, 'update'])->name('pharmacien.medicaments.update');
        Route::delete('/pharmacien/medicaments/{medicament}', [MedicamentController::class, 'destroy'])->name('pharmacien.medicaments.destroy');

        // Order management
        Route::get('/pharmacien/orders', [OrderController::class, 'pharmacienOrders'])->name('pharmacien.orders');
        Route::patch('/pharmacien/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('pharmacien.orders.update-status');

        // Rare requests management
        Route::get('/pharmacien/rare-requests', [RareRequestController::class, 'pharmacienIndex'])->name('pharmacien.rare-requests');
        Route::patch('/pharmacien/rare-requests/{rareRequest}/status', [RareRequestController::class, 'updateStatus'])->name('pharmacien.rare-requests.update-status');
    });
});

require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';