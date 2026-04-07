<?php

namespace App\Http\Controllers;

use App\Models\Pharmacy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class PharmacyController extends Controller
{
    /**
     * Show the pharmacy creation page for pharmacists.
     */
    public function create(): Response|RedirectResponse
    {
        if (auth()->user()?->pharmacy) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('pharmacien/create-pharmacy');
    }

    /**
     * Store a newly created pharmacy for the authenticated pharmacist.
     */
    public function store(Request $request): RedirectResponse
    {
        if (auth()->user()?->pharmacy) {
            return redirect()->route('dashboard')->with('error', 'Pharmacy already exists.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]);

        Pharmacy::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'address' => $validated['address'],
            'phone' => $validated['phone'],
        ]);

        return redirect()->route('dashboard');
    }

    /**
     * Display a listing of all pharmacies.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $pharmacies = Pharmacy::with('user')
                ->paginate(15);

            return response()->json([
                'message' => 'Pharmacies retrieved successfully',
                'data' => $pharmacies->items(),
                'pagination' => [
                    'current_page' => $pharmacies->currentPage(),
                    'total' => $pharmacies->total(),
                    'per_page' => $pharmacies->perPage(),
                    'last_page' => $pharmacies->lastPage(),
                ],
            ], HttpResponse::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving pharmacies',
            ], HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified pharmacy.
     *
     * @param Pharmacy $pharmacy
     * @return JsonResponse
     */
    public function show(Pharmacy $pharmacy): JsonResponse
    {
        try {
            $pharmacy->load(['user', 'medicaments']);

            return response()->json([
                'message' => 'Pharmacy retrieved successfully',
                'data' => [
                    'id' => $pharmacy->id,
                    'name' => $pharmacy->name,
                    'address' => $pharmacy->address,
                    'phone' => $pharmacy->phone,
                    'status_garde' => $pharmacy->status_garde,
                    'pharmacist' => [
                        'id' => $pharmacy->user->id,
                        'name' => $pharmacy->user->name,
                        'email' => $pharmacy->user->email,
                    ],
                    'medicament_count' => $pharmacy->medicaments()->count(),
                    'available_medicaments' => $pharmacy->medicaments()
                        ->where('stock', '>', 0)
                        ->count(),
                    'created_at' => $pharmacy->created_at,
                ],
            ], HttpResponse::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving pharmacy',
            ], HttpResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
