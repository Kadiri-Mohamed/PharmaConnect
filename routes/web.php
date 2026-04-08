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

        return Inertia::render('Client/Dashboard');
    })->name('dashboard');

    Route::middleware(['role:pharmacien'])->group(function () {
        Route::get('/pharmacy/create', [PharmacyController::class, 'create'])->name('pharmacy.create');
        Route::post('/pharmacy', [PharmacyController::class, 'store'])->name('pharmacy.store');

        Route::get('/pharmacien/dashboard', fn () => Inertia::render('pharmacien-dashboard'))->name('pharmacien.dashboard');
        Route::get('/pharmacien/my-pharmacy', fn () => Inertia::render('pharmacien/my-pharmacy'))->name('pharmacien.my-pharmacy');

        Route::get('/pharmacien/medicaments', fn () => Inertia::render('pharmacien/Medicaments/Index'))
            ->name('pharmacien.medicaments');

        Route::get('/pharmacien/orders', fn () => Inertia::render('pharmacien/manage-orders'))->name('pharmacien.orders');
        Route::get('/pharmacien/rare-requests', fn () => Inertia::render('pharmacien/manage-rare-requests'))->name('pharmacien.rare-requests');
    });

    Route::middleware(['role:client'])->group(function () {
        Route::get('/cart', fn () => Inertia::render('cart'))->name('cart');
        Route::get('/orders', fn () => Inertia::render('orders'))->name('orders');
        Route::get('/medicaments', fn () => Inertia::render('medicaments'))->name('medicaments');
        Route::get('/pharmacies', fn () => Inertia::render('pharmacies'))->name('pharmacies');
        Route::get('/rare-requests', fn () => Inertia::render('rare-requests'))->name('rare-requests');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
