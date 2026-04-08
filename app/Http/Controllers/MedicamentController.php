<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicamentRequest;
use App\Http\Requests\UpdateMedicamentRequest;
use App\Models\Medicament;
use App\Models\Pharmacy;
use App\Services\MedicamentService;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MedicamentController extends Controller
{
    /**
     * Constructor to inject service.
     *
     * @param MedicamentService $medicamentService
     */
    public function __construct(private MedicamentService $medicamentService) {}

    /**
     * List medicaments that belong to the authenticated pharmacist pharmacy.
     */
    public function pharmacienIndex(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (! $user || $user->role !== 'pharmacien') {
            return response()->json([
                'message' => 'Unauthorized',
            ], Response::HTTP_FORBIDDEN);
        }

        if (! $user->pharmacy) {
            return response()->json([
                'message' => 'No pharmacy found for this pharmacist.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $search = trim((string) $request->query('search', ''));
        $stockFilter = (string) $request->query('stock', '');
        $perPage = min(max((int) $request->query('per_page', 10), 1), 50);

        $query = Medicament::query()
            ->where('pharmacy_id', $user->pharmacy->id)
            ->latest();

        if ($search !== '') {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($stockFilter === 'in_stock') {
            $query->where('stock', '>', 0);
        } elseif ($stockFilter === 'out_of_stock') {
            $query->where('stock', '<=', 0);
        }

        $medicaments = $query->paginate($perPage);

        return response()->json([
            'message' => 'Medicaments retrieved successfully',
            'data' => $medicaments->items(),
            'pagination' => [
                'current_page' => $medicaments->currentPage(),
                'total' => $medicaments->total(),
                'per_page' => $medicaments->perPage(),
                'last_page' => $medicaments->lastPage(),
            ],
        ], Response::HTTP_OK);
    }

    /**
     * Display a listing of medicaments.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $medicaments = Medicament::with('pharmacy')
                ->paginate(15);

            return response()->json([
                'message' => 'Medicaments retrieved successfully',
                'data' => $medicaments->items(),
                'pagination' => [
                    'current_page' => $medicaments->currentPage(),
                    'total' => $medicaments->total(),
                    'per_page' => $medicaments->perPage(),
                    'last_page' => $medicaments->lastPage(),
                ],
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving medicaments',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created medicament.
     *
     * @param StoreMedicamentRequest $request
     * @return JsonResponse
     */
    public function store(StoreMedicamentRequest $request): JsonResponse
    {
        $user = auth()->user();
        if (! $user || $user->role !== 'pharmacien') {
            return response()->json([
                'message' => 'Unauthorized',
            ], Response::HTTP_FORBIDDEN);
        }

        if (! $user->pharmacy) {
            return response()->json([
                'message' => 'No pharmacy found for this pharmacist.',
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $validated = $request->validated();
            $validated['pharmacy_id'] = $user->pharmacy->id;
            $medicament = Medicament::create($validated);

            return response()->json([
                'message' => 'Medicament created successfully',
                'data' => $medicament,
            ], Response::HTTP_CREATED);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating medicament',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified medicament.
     *
     * @param Medicament $medicament
     * @return JsonResponse
     */
    public function show(Medicament $medicament): JsonResponse
    {
        try {
            $medicament->load('pharmacy');

            $availability = $this->medicamentService->getAvailabilityStatus($medicament);

            return response()->json([
                'message' => 'Medicament retrieved successfully',
                'data' => [
                    'id' => $medicament->id,
                    'name' => $medicament->name,
                    'description' => $medicament->description,
                    'price' => $medicament->price,
                    'stock' => $medicament->stock,
                    'requires_prescription' => $medicament->requires_prescription,
                    'pharmacy' => [
                        'id' => $medicament->pharmacy->id,
                        'name' => $medicament->pharmacy->name,
                    ],
                    'availability' => $availability,
                ],
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving medicament',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the specified medicament.
     *
     * @param UpdateMedicamentRequest $request
     * @param Medicament $medicament
     * @return JsonResponse
     */
    public function update(UpdateMedicamentRequest $request, Medicament $medicament): JsonResponse
    {
        $user = auth()->user();
        if (! $user || $user->role !== 'pharmacien') {
            return response()->json([
                'message' => 'Unauthorized',
            ], Response::HTTP_FORBIDDEN);
        }

        if (! $user->pharmacy || $medicament->pharmacy_id !== $user->pharmacy->id) {
            return response()->json([
                'message' => 'You can only manage medicaments from your own pharmacy.',
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $medicament->update($request->validated());

            return response()->json([
                'message' => 'Medicament updated successfully',
                'data' => $medicament->fresh(),
            ], Response::HTTP_OK);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating medicament',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified medicament.
     *
     * @param Medicament $medicament
     * @return JsonResponse
     */
    public function destroy(Medicament $medicament): JsonResponse
    {
        $user = auth()->user();
        if (! $user || $user->role !== 'pharmacien') {
            return response()->json([
                'message' => 'Unauthorized',
            ], Response::HTTP_FORBIDDEN);
        }

        if (! $user->pharmacy || $medicament->pharmacy_id !== $user->pharmacy->id) {
            return response()->json([
                'message' => 'You can only manage medicaments from your own pharmacy.',
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $medicament->delete();

            return response()->json([
                'message' => 'Medicament deleted successfully',
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting medicament',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display medicaments for a single pharmacy.
     */
    public function getByPharmacy(Pharmacy $pharmacy): JsonResponse
    {
        $medicaments = $pharmacy->medicaments()->paginate(15);

        return response()->json([
            'message' => 'Medicaments retrieved successfully',
            'data' => $medicaments->items(),
            'pagination' => [
                'current_page' => $medicaments->currentPage(),
                'total' => $medicaments->total(),
                'per_page' => $medicaments->perPage(),
                'last_page' => $medicaments->lastPage(),
            ],
        ], Response::HTTP_OK);
    }

    /**
     * Search medicaments by name.
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        if ($q === '') {
            return response()->json([
                'message' => 'Query is required',
                'data' => [],
            ], Response::HTTP_BAD_REQUEST);
        }

        $medicaments = Medicament::with('pharmacy')
            ->where('name', 'like', "%{$q}%")
            ->paginate(15);

        return response()->json([
            'message' => 'Medicaments retrieved successfully',
            'data' => $medicaments->items(),
            'pagination' => [
                'current_page' => $medicaments->currentPage(),
                'total' => $medicaments->total(),
                'per_page' => $medicaments->perPage(),
                'last_page' => $medicaments->lastPage(),
            ],
        ], Response::HTTP_OK);
    }
}
