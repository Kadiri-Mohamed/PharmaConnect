<?php

namespace App\Http\Controllers;

use App\Models\Medicament;
use App\Http\Requests\MedicineRequest;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MedicineController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get all medicines with pagination (optionally filtered by pharmacy).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 15);
            $search = $request->query('search');
            $pharmacyId = $request->query('pharmacy_id');

            $query = Medicament::query();

            // Filter by pharmacy if provided
            if ($pharmacyId) {
                $query->byPharmacy($pharmacyId);
            }

            // Search by name or description
            if ($search) {
                $query->search($search);
            }

            // Filter by prescription requirement if provided
            if ($request->query('requires_prescription')) {
                $query->requiresPrescription();
            }

            // Filter by stock status if provided
            if ($request->query('in_stock') === 'true') {
                $query->inStock();
            }

            $medicines = $query->with('pharmacy')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return $this->successResponse(
                'Medicines retrieved successfully',
                [
                    'medicines' => $medicines->items(),
                    'pagination' => [
                        'total' => $medicines->total(),
                        'per_page' => $medicines->perPage(),
                        'current_page' => $medicines->currentPage(),
                        'last_page' => $medicines->lastPage(),
                        'from' => $medicines->firstItem(),
                        'to' => $medicines->lastItem(),
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve medicines', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get medicines by a specific pharmacy.
     */
    public function byPharmacy(int $pharmacyId, Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 15);
            $search = $request->query('search');

            $query = Medicament::byPharmacy($pharmacyId);

            if ($search) {
                $query->search($search);
            }

            if ($request->query('in_stock') === 'true') {
                $query->inStock();
            }

            $medicines = $query->orderBy('name', 'asc')
                ->paginate($perPage);

            if ($medicines->isEmpty()) {
                return $this->successResponse(
                    'No medicines found for this pharmacy',
                    [
                        'medicines' => [],
                        'pagination' => [
                            'total' => 0,
                            'per_page' => $perPage,
                            'current_page' => 1,
                            'last_page' => 1,
                        ],
                    ]
                );
            }

            return $this->successResponse(
                'Medicines retrieved successfully',
                [
                    'medicines' => $medicines->items(),
                    'pagination' => [
                        'total' => $medicines->total(),
                        'per_page' => $medicines->perPage(),
                        'current_page' => $medicines->currentPage(),
                        'last_page' => $medicines->lastPage(),
                        'from' => $medicines->firstItem(),
                        'to' => $medicines->lastItem(),
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve medicines',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Show a specific medicine.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $medicine = Medicament::with('pharmacy')->find($id);

            if (!$medicine) {
                return $this->errorResponse('Medicine not found', null, 404);
            }

            return $this->successResponse(
                'Medicine retrieved successfully',
                ['medicine' => $medicine]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve medicine',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Create a new medicine (only pharmacists can create).
     */
    public function store(MedicineRequest $request): JsonResponse
    {
        try {
            $user = auth('api')->user();

            // Verify the user has a pharmacy
            if (!$user->pharmacy) {
                return $this->errorResponse(
                    'You must have a pharmacy profile to manage medicines',
                    null,
                    403
                );
            }

            $validated = $request->validated();

            $medicine = Medicament::create($validated);

            return $this->createdResponse(
                'Medicine created successfully',
                ['medicine' => $medicine->load('pharmacy')]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to create medicine',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Update a medicine (only the pharmacy owner can update).
     */
    public function update(MedicineRequest $request, int $id): JsonResponse
    {
        try {
            $user = auth('api')->user();

            $medicine = Medicament::find($id);

            if (!$medicine) {
                return $this->errorResponse('Medicine not found', null, 404);
            }

            // Verify the user owns the pharmacy that owns the medicine
            if ($medicine->pharmacy_id !== $user->pharmacy?->id) {
                return $this->errorResponse(
                    'You are not authorized to update this medicine',
                    null,
                    403
                );
            }

            $validated = $request->validated();
            $medicine->update($validated);

            return $this->successResponse(
                'Medicine updated successfully',
                ['medicine' => $medicine->load('pharmacy')]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to update medicine',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Delete a medicine (only the pharmacy owner can delete).
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $user = auth('api')->user();

            $medicine = Medicament::find($id);

            if (!$medicine) {
                return $this->errorResponse('Medicine not found', null, 404);
            }

            // Verify the user owns the pharmacy that owns the medicine
            if ($medicine->pharmacy_id !== $user->pharmacy?->id) {
                return $this->errorResponse(
                    'You are not authorized to delete this medicine',
                    null,
                    403
                );
            }

            // Check if medicine is in use (has cart items or order items)
            if ($medicine->panierItems()->exists() || $medicine->commandeItems()->exists()) {
                return $this->errorResponse(
                    'Cannot delete medicine that is in use by customers',
                    null,
                    409
                );
            }

            $medicine->delete();

            return $this->successResponse('Medicine deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to delete medicine',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get low stock medicines for the authenticated pharmacy.
     */
    public function lowStock(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();

            if (!$user->pharmacy) {
                return $this->errorResponse(
                    'You must have a pharmacy profile to view stock',
                    null,
                    403
                );
            }

            $threshold = $request->query('threshold', 10);

            $medicines = Medicament::byPharmacy($user->pharmacy->id)
                ->lowStock($threshold)
                ->orderBy('stock', 'asc')
                ->get();

            return $this->successResponse(
                'Low stock medicines retrieved successfully',
                ['medicines' => $medicines, 'threshold' => $threshold]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve low stock medicines',
                ['error' => $e->getMessage()],
                500
            );
        }
    }
}
