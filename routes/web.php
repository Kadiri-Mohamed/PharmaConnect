<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
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

    Route::get('/dashboard', function () {
        return Inertia::render('pharmacien-dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
