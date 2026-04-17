<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicamentRequest;
use App\Http\Requests\UpdateMedicamentRequest;
use App\Models\Medicament;
use DomainException;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicamentController extends Controller
{
    public function pharmacienIndex(Request $request)
    {
        $user = $request->user();
        $pharmacy = $user->pharmacy;

        $medicaments = Medicament::where('pharmacy_id', $pharmacy->id)->latest()->get();

        $formattedMedicaments = [];
        foreach ($medicaments as $medicament) {
            $formattedMedicaments[] = $this->formatMedicament($medicament);
        }

        return Inertia::render('pharmacien/Medicaments/Index', [
            'medicaments' => $formattedMedicaments,
        ]);
    }

    public function index(Request $request)
    {
        $medicaments = Medicament::with('pharmacy')->latest()->get();

        $formattedMedicaments = [];
        foreach ($medicaments as $medicament) {
            $formattedMedicaments[] = $this->formatMedicament($medicament);
        }

        return Inertia::render('medicaments', [
            'medicaments' => $formattedMedicaments,
        ]);
    }

    public function store(StoreMedicamentRequest $request)
    {
        try {
            $user = $request->user();
            $pharmacy = $user->pharmacy;

            $data = $request->validated();
            $data['pharmacy_id'] = $pharmacy->id;

            Medicament::create($data);

            return back()->with('success', 'Medicament created.');
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function update(UpdateMedicamentRequest $request, Medicament $medicament)
    {
        $user = $request->user();
        $pharmacy = $user->pharmacy;

        if ($medicament->pharmacy_id !== $pharmacy->id) {
            abort(403);
        }

        try {
            $medicament->update($request->validated());
            return back()->with('success', 'Medicament updated.');
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(Request $request, Medicament $medicament)
    {
        $user = $request->user();
        $pharmacy = $user->pharmacy;

        if ($medicament->pharmacy_id !== $pharmacy->id) {
            abort(403);
        }

        $medicament->delete();

        return back()->with('success', 'Medicament deleted.');
    }

    private function formatMedicament(Medicament $medicament): array
    {
        $result = [
            'id' => $medicament->id,
            'name' => $medicament->name,
            'description' => $medicament->description,
            'price' => $medicament->price,
            'stock' => $medicament->stock,
            'requires_prescription' => (bool) $medicament->requires_prescription,
            'pharmacy' => [
                'id' => $medicament->pharmacy->id,
                'name' => $medicament->pharmacy->name,
                'address' => $medicament->pharmacy->address,
                'phone' => $medicament->pharmacy->phone,
            ]
        ];
        return $result;
    }
}