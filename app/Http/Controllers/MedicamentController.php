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
        $pharmacy = $request->user()->pharmacy;
        $search = trim((string) $request->query('search', ''));
        $stock = (string) $request->query('stock', 'all');
        $perPage = min(max((int) $request->query('per_page', 10), 1), 50);

        $query = Medicament::query()
            ->where('pharmacy_id', $pharmacy->id)
            ->latest();

        if ($search !== '') {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($stock === 'in_stock') {
            $query->where('stock', '>', 0);
        } elseif ($stock === 'out_of_stock') {
            $query->where('stock', '<=', 0);
        }

        $medicaments = $query->paginate($perPage)->withQueryString();

        return Inertia::render('pharmacien/Medicaments/Index', [
            'medicaments' => $medicaments->through(fn (Medicament $medicament) => $this->formatMedicament($medicament)),
            'pagination' => [
                'current_page' => $medicaments->currentPage(),
                'last_page' => $medicaments->lastPage(),
                'per_page' => $medicaments->perPage(),
                'total' => $medicaments->total(),
            ],
            'filters' => [
                'search' => $search,
                'stock' => $stock,
            ],
        ]);
    }

    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $query = Medicament::query()
            ->with('pharmacy')
            ->latest();

        if ($search !== '') {
            $query->where(function ($medicaments) use ($search) {
                $medicaments
                    ->where('name', 'like', "%{$search}%")
                    ->orWhereHas('pharmacy', fn ($pharmacy) => $pharmacy->where('name', 'like', "%{$search}%"));
            });
        }

        return Inertia::render('medicaments', [
            'medicaments' => $query
                ->get()
                ->map(fn (Medicament $medicament) => $this->formatMedicament($medicament))
                ->values(),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreMedicamentRequest $request)
    {
        try {
            Medicament::create([
                ...$request->validated(),
                'pharmacy_id' => $request->user()->pharmacy->id,
            ]);
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Medicament created.');
    }

    public function update(UpdateMedicamentRequest $request, Medicament $medicament)
    {
        abort_unless($medicament->pharmacy_id === $request->user()->pharmacy?->id, 403);

        try {
            $medicament->update($request->validated());
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Medicament updated.');
    }

    public function destroy(Request $request, Medicament $medicament)
    {
        abort_unless($medicament->pharmacy_id === $request->user()->pharmacy?->id, 403);

        $medicament->delete();

        return back()->with('success', 'Medicament deleted.');
    }

    private function formatMedicament(Medicament $medicament): array
    {
        return [
            'id' => $medicament->id,
            'name' => $medicament->name,
            'description' => $medicament->description,
            'price' => $medicament->price,
            'stock' => $medicament->stock,
            'requires_prescription' => (bool) $medicament->requires_prescription,
            'pharmacy' => $medicament->relationLoaded('pharmacy') && $medicament->pharmacy ? [
                'id' => $medicament->pharmacy->id,
                'name' => $medicament->pharmacy->name,
                'address' => $medicament->pharmacy->address,
                'phone' => $medicament->pharmacy->phone,
            ] : null,
        ];
    }
}
