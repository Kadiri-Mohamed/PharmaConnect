<?php

<<<<<<< HEAD
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\VerifyEmailController;
=======
use App\Http\Controllers\CartController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\OrderController;
>>>>>>> abb3fb790f53f244a146bcee742f47d90d11522a
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
Route::get('/rare-requests/create', [RareRequestController::class, 'create'])->name('rare-requests.create');
Route::post('/rare-requests', [RareRequestController::class, 'store'])->name('rare-requests.store');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
<<<<<<< HEAD
    Route::get('/email/verify', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware(['throttle:6,1'])
        ->name('verification.send');

    Route::get('/verify-email', fn () => redirect()->route('verification.notice'));
    Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1']);

    Route::middleware(['verified'])->group(function () {
        Route::get('/prescriptions/{prescription}/file', [PrescriptionController::class, 'file'])
            ->name('prescriptions.file');

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
            Route::get('/pharmacien/rare-requests', fn () => Inertia::render('Pharmacien/RareRequests/Index'))
                ->name('pharmacien.rare-requests');
        });

        Route::middleware(['role:client'])->group(function () {
            Route::get('/cart', fn () => Inertia::render('cart'))->name('cart');
            Route::get('/orders', fn () => Inertia::render('orders'))->name('orders');
            Route::get('/prescriptions', fn () => Inertia::render('prescriptions'))->name('prescriptions');
            Route::get('/medicaments', fn () => Inertia::render('medicaments'))->name('medicaments');
            Route::get('/pharmacies', fn () => Inertia::render('pharmacies'))->name('pharmacies');
            Route::get('/pharmacies/{pharmacy}', function (string $pharmacy) {
                return Inertia::render('pharmacy-details', [
                    'pharmacyId' => (int) $pharmacy,
                ]);
            })->name('pharmacy.details');
            Route::get('/rare-requests', fn () => Inertia::render('RareRequests/Index'))->name('rare-requests');
        });
=======
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/prescriptions/{prescription}/file', [PrescriptionController::class, 'file'])->name('prescriptions.file');

    // Client 
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
        Route::get('/prescriptions', [PrescriptionController::class, 'index'])->name('prescriptions');
        Route::post('/prescriptions', [PrescriptionController::class, 'store'])->name('prescriptions.store');

        // Rare requests
        Route::get('/rare-requests', [RareRequestController::class, 'index'])->name('rare-requests');
    });

    // Pharmacist 
    Route::middleware(['role:pharmacien'])->group(function () {
        // Pharmacy
        Route::get('/create-pharmacy', [PharmacyController::class, 'create'])->name('pharmacy.create');
        Route::post('/pharmacy', [PharmacyController::class, 'store'])->name('pharmacy.store');
        
        // Dashboard 
        Route::get('/pharmacien/dashboard', [DashboardController::class, 'pharmacien'])->name('pharmacien.dashboard');
        Route::get('/my-pharmacy', [PharmacyController::class, 'myPharmacy'])->name('pharmacien.my-pharmacy');
        Route::patch('/my-pharmacy', [PharmacyController::class, 'updateMyPharmacy'])->name('pharmacien.my-pharmacy.update');

        // Medicament manage
        Route::get('/pharmacien/medicaments', [MedicamentController::class, 'pharmacienIndex'])->name('pharmacien.medicaments');
        Route::post('/pharmacien/medicaments', [MedicamentController::class, 'store'])->name('pharmacien.medicaments.store');
        Route::put('/pharmacien/medicaments/{medicament}', [MedicamentController::class, 'update'])->name('pharmacien.medicaments.update');
        Route::delete('/pharmacien/medicaments/{medicament}', [MedicamentController::class, 'destroy'])->name('pharmacien.medicaments.destroy');

        // Order manage
        Route::get('/pharmacien/orders', [OrderController::class, 'pharmacienOrders'])->name('pharmacien.orders');
        Route::patch('/pharmacien/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('pharmacien.orders.update-status');

        // Rare requests manage
        Route::get('/pharmacien/rare-requests', [RareRequestController::class, 'pharmacienIndex'])->name('pharmacien.rare-requests');
        Route::patch('/pharmacien/rare-requests/{rareRequest}/status', [RareRequestController::class, 'updateStatus'])->name('pharmacien.rare-requests.update-status');
>>>>>>> abb3fb790f53f244a146bcee742f47d90d11522a
    });
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
