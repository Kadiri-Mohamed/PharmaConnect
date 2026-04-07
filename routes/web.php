<?php

use App\Http\Controllers\PharmacyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        if (auth()->user()?->role === 'pharmacien') {
            return redirect()->route('pharmacien.dashboard');
        }

        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::middleware(['role:pharmacien'])->group(function () {
        Route::get('/pharmacy/create', [PharmacyController::class, 'create'])->name('pharmacy.create');
        Route::post('/pharmacy', [PharmacyController::class, 'store'])->name('pharmacy.store');

        Route::get('/pharmacien/dashboard', function () {
            return Inertia::render('pharmacien-dashboard');
        })->name('pharmacien.dashboard');
    });

    Route::middleware(['role:client'])->group(function () {
        Route::get('/cart', function () {
            return Inertia::render('cart');
        })->name('cart');

        Route::get('/orders', function () {
            return Inertia::render('orders');
        })->name('orders');

        Route::get('/medicaments', function () {
            return Inertia::render('medicaments');
        })->name('medicaments');

        Route::get('/pharmacies', function () {
            return Inertia::render('pharmacies');
        })->name('pharmacies');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
