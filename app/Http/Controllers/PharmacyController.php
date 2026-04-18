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
        if (auth()->user()->pharmacy) {
            return redirect()->route('pharmacien.my-pharmacy');
        }

        return Inertia::render('create-pharmacy');
    }

    public function store(StorePharmacyRequest $request): RedirectResponse
    {
        if (auth()->user()->pharmacy) {
            return redirect()->route('pharmacien.my-pharmacy')->with('error', 'Pharmacy already exists.');
        }

        $data = [
            'user_id' => auth()->id(),
            'name' => $request['name'],
            'address' => $request['address'],
            'phone' => $request['phone'],
        ];

        Pharmacy::create($data);

        return redirect()->route('pharmacien.dashboard')->with('success', 'Pharmacy created successfully.');
    }

    public function myPharmacy()
    {
        $pharmacy = auth()->user()->pharmacy;

        if (!$pharmacy) {
            abort(403);
        }

        return Inertia::render('my-pharmacy', [
            'pharmacy' => [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' =>  $pharmacy->status_garde,
            ],
        ]);
    }

    public function updateMyPharmacy(UpdatePharmacyRequest $request)
    {
        $pharmacy = $request->user()->pharmacy;

        if (!$pharmacy) {
            abort(403);
        }

        $data = [
            'name' => $request['name'],
            'address' => $request['address'],
            'phone' => $request['phone'],
            'status_garde' => $request['status_garde'],
        ];

        $pharmacy->update($data);

        return back()->with('success', 'Pharmacy profile updated.');
    }

    public function index()
    {
        $pharmacies = Pharmacy::withCount('medicaments')->latest()->get();
        
        $formattedPharmacies = [];
        foreach ($pharmacies as $pharmacy) {
            $availableCount = $pharmacy->medicaments()->where('stock', '>', 0)->count();
            
            $formattedPharmacies[] = [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' =>  $pharmacy->status_garde,
                'medicament_count' => $pharmacy->medicaments_count,
                'available_medicaments' => $availableCount,
            ];
        }

        return Inertia::render('pharmacies', [
            'pharmacies' => $formattedPharmacies,
        ]);
    }

    public function show(Pharmacy $pharmacy)
    {
        $pharmacy->load('user');
        
        $medicaments = $pharmacy->medicaments()->latest()->get();
        
        $formattedMedicaments = [];
        foreach ($medicaments as $medicament) {
            $formattedMedicaments[] = [
                'id' => $medicament->id,
                'name' => $medicament->name,
                'description' => $medicament->description,
                'price' => $medicament->price,
                'stock' => $medicament->stock,
                'requires_prescription' => $medicament->requires_prescription,
            ];
        }
        
        $availableMedicaments = 0;
        foreach ($medicaments as $medicament) {
            if ($medicament->stock > 0) {
                $availableMedicaments++;
            }
        }

        return Inertia::render('pharmacy-details', [
            'pharmacy' => [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' =>  $pharmacy->status_garde,
                'pharmacist' => $pharmacy->user ? [
                    'id' => $pharmacy->user->id,
                    'name' => $pharmacy->user->name,
                    'email' => $pharmacy->user->email,
                ] : null,
                'medicament_count' => $medicaments->count(),
                'available_medicaments' => $availableMedicaments,
                'created_at' => $pharmacy->created_at,
            ],
            'medicaments' => $formattedMedicaments,
        ]);
    }
}
