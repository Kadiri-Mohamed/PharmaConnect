<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePharmacyRequest;
use App\Http\Requests\UpdatePharmacyRequest;
use App\Models\Medicament;
use App\Models\Pharmacy;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PharmacyController extends Controller
{
    public function create()
    {
        if (auth()->user()?->pharmacy) {
            return redirect()->route('pharmacien.my-pharmacy');
        }

        return Inertia::render('pharmacien/create-pharmacy');
    }

    public function store(StorePharmacyRequest $request): RedirectResponse
    {
        if (auth()->user()?->pharmacy) {
            return redirect()->route('pharmacien.my-pharmacy')->with('error', 'Pharmacy already exists.');
        }

        Pharmacy::create([
            'user_id' => auth()->id(),
            ...$request->validated(),
        ]);

        return redirect()->route('pharmacien.dashboard')->with('success', 'Pharmacy created successfully.');
    }

    public function myPharmacy()
    {
        $pharmacy = auth()->user()->pharmacy;

        abort_unless($pharmacy, 403);

        return Inertia::render('pharmacien/my-pharmacy', [
            'pharmacy' => [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' => (bool) $pharmacy->status_garde,
            ],
        ]);
    }

    public function updateMyPharmacy(UpdatePharmacyRequest $request)
    {
        $pharmacy = $request->user()->pharmacy;

        abort_unless($pharmacy, 403);

        $pharmacy->update($request->validated());

        return back()->with('success', 'Pharmacy profile updated.');
    }

    public function index()
    {
        $pharmacies = Pharmacy::query()
            ->withCount('medicaments')
            ->withCount([
                'medicaments as available_medicaments' => fn ($query) => $query->where('stock', '>', 0),
            ])
            ->latest()
            ->get()
            ->map(fn (Pharmacy $pharmacy) => [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' => (bool) $pharmacy->status_garde,
                'medicament_count' => $pharmacy->medicament_count,
                'available_medicaments' => $pharmacy->available_medicaments,
            ])
            ->values();

        return Inertia::render('pharmacies', [
            'pharmacies' => $pharmacies,
        ]);
    }

    public function show(Pharmacy $pharmacy)
    {
        $pharmacy->load('user');
        $pharmacy->loadCount('medicaments');
        $availableMedicaments = $pharmacy->medicaments()->where('stock', '>', 0)->count();
        $medicaments = $pharmacy->medicaments()
            ->latest()
            ->get()
            ->map(fn (Medicament $medicament) => [
                'id' => $medicament->id,
                'name' => $medicament->name,
                'description' => $medicament->description,
                'price' => $medicament->price,
                'stock' => $medicament->stock,
                'requires_prescription' => (bool) $medicament->requires_prescription,
            ])
            ->values();

        return Inertia::render('pharmacy-details', [
            'pharmacy' => [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' => (bool) $pharmacy->status_garde,
                'pharmacist' => $pharmacy->user ? [
                    'id' => $pharmacy->user->id,
                    'name' => $pharmacy->user->name,
                    'email' => $pharmacy->user->email,
                ] : null,
                'medicament_count' => $pharmacy->medicament_count,
                'available_medicaments' => $availableMedicaments,
                'created_at' => $pharmacy->created_at,
            ],
            'medicaments' => $medicaments,
        ]);
    }
}
