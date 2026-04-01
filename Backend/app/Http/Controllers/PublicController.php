<?php

namespace App\Http\Controllers;

use App\Models\Pharmacy;
use App\Models\Medicament;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PublicController extends Controller
{
    use ApiResponseTrait;

    /**
     * List all pharmacies with optional filters.
     * Supports: search (name/address), on-duty filter, pagination.
     */
    public function pharmacies(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 15);
            $search = $request->query('search');
            $onDuty = $request->query('on_duty');
            $sortBy = $request->query('sort_by', 'name');
            $sortOrder = $request->query('sort_order', 'asc');

            $query = Pharmacy::query();

            // Search filter
            if ($search) {
                $query->search($search);
            }

            // On-duty filter
            if ($onDuty !== null) {
                $onDuty = filter_var($onDuty, FILTER_VALIDATE_BOOLEAN);
                $query->where('is_on_duty', $onDuty);
            }

            // Sorting
            $allowedSortFields = ['name', 'created_at', 'is_on_duty'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
            } else {
                $query->orderBy('name', 'asc');
            }

            $pharmacies = $query->paginate($perPage);

            $pharmacies->getCollection()->transform(function ($pharmacy) {
                return [
                    'id' => $pharmacy->id,
                    'name' => $pharmacy->name,
                    'address' => $pharmacy->address,
                    'phone' => $pharmacy->phone,
                    'opening_hours' => $pharmacy->opening_hours,
                    'is_on_duty' => $pharmacy->is_on_duty,
                    'created_at' => $pharmacy->created_at,
                ];
            });

            return $this->successResponse(
                'Pharmacies retrieved successfully',
                [
                    'pharmacies' => $pharmacies->items(),
                    'pagination' => [
                        'total' => $pharmacies->total(),
                        'per_page' => $pharmacies->perPage(),
                        'current_page' => $pharmacies->currentPage(),
                        'last_page' => $pharmacies->lastPage(),
                        'from' => $pharmacies->firstItem(),
                        'to' => $pharmacies->lastItem(),
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve pharmacies',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get pharmacies that are currently on duty (de garde).
     */
    public function pharmaciesOnDuty(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 15);

            $pharmacies = Pharmacy::onDuty()
                ->orderBy('name', 'asc')
                ->paginate($perPage);

            $pharmacies->getCollection()->transform(function ($pharmacy) {
                return [
                    'id' => $pharmacy->id,
                    'name' => $pharmacy->name,
                    'address' => $pharmacy->address,
                    'phone' => $pharmacy->phone,
                    'opening_hours' => $pharmacy->opening_hours,
                    'is_on_duty' => $pharmacy->is_on_duty,
                ];
            });

            return $this->successResponse(
                'On-duty pharmacies retrieved successfully',
                [
                    'pharmacies' => $pharmacies->items(),
                    'pagination' => [
                        'total' => $pharmacies->total(),
                        'per_page' => $pharmacies->perPage(),
                        'current_page' => $pharmacies->currentPage(),
                        'last_page' => $pharmacies->lastPage(),
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve on-duty pharmacies',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get a specific pharmacy with its medicines.
     */
    public function pharmacy(int $id): JsonResponse
    {
        try {
            $pharmacy = Pharmacy::with(['medicaments' => function ($query) {
                $query->inStock()->orderBy('name', 'asc');
            }])->find($id);

            if (!$pharmacy) {
                return $this->errorResponse('Pharmacy not found', null, 404);
            }

            $medicines = $pharmacy->medicaments->map(function ($medicine) {
                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'description' => $medicine->description,
                    'price' => $medicine->price,
                    'stock' => $medicine->stock,
                    'requires_prescription' => $medicine->requires_prescription,
                ];
            });

            return $this->successResponse(
                'Pharmacy retrieved successfully',
                [
                    'pharmacy' => [
                        'id' => $pharmacy->id,
                        'name' => $pharmacy->name,
                        'address' => $pharmacy->address,
                        'phone' => $pharmacy->phone,
                        'opening_hours' => $pharmacy->opening_hours,
                        'is_on_duty' => $pharmacy->is_on_duty,
                        'medicines_count' => $medicines->count(),
                        'medicines' => $medicines,
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve pharmacy',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * List all medicines from all pharmacies (public catalog).
     * Supports: search, pharmacy filter, prescription filter, price range, pagination.
     */
    public function medicines(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 20);
            $search = $request->query('search');
            $pharmacyId = $request->query('pharmacy_id');
            $requiresPrescription = $request->query('requires_prescription');
            $minPrice = $request->query('min_price');
            $maxPrice = $request->query('max_price');
            $inStock = $request->query('in_stock', 'true');
            $sortBy = $request->query('sort_by', 'name');
            $sortOrder = $request->query('sort_order', 'asc');

            $query = Medicament::with('pharmacy:id,name,address,is_on_duty');

            // Search filter
            if ($search) {
                $query->search($search);
            }

            // Pharmacy filter
            if ($pharmacyId) {
                $query->byPharmacy($pharmacyId);
            }

            // Prescription requirement filter
            if ($requiresPrescription !== null) {
                $requiresPrescription = filter_var($requiresPrescription, FILTER_VALIDATE_BOOLEAN);
                $query->where('requires_prescription', $requiresPrescription);
            }

            // Price range filter
            if ($minPrice !== null && is_numeric($minPrice)) {
                $query->where('price', '>=', $minPrice);
            }
            if ($maxPrice !== null && is_numeric($maxPrice)) {
                $query->where('price', '<=', $maxPrice);
            }

            // Stock filter (default to in stock only)
            if ($inStock !== null) {
                $inStock = filter_var($inStock, FILTER_VALIDATE_BOOLEAN);
                if ($inStock) {
                    $query->inStock();
                }
            }

            // Sorting
            $allowedSortFields = ['name', 'price', 'stock', 'created_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
            } else {
                $query->orderBy('name', 'asc');
            }

            $medicines = $query->paginate($perPage);

            $medicines->getCollection()->transform(function ($medicine) {
                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'description' => $medicine->description,
                    'price' => $medicine->price,
                    'stock' => $medicine->stock,
                    'requires_prescription' => $medicine->requires_prescription,
                    'pharmacy' => [
                        'id' => $medicine->pharmacy->id,
                        'name' => $medicine->pharmacy->name,
                        'address' => $medicine->pharmacy->address,
                        'is_on_duty' => $medicine->pharmacy->is_on_duty,
                    ],
                ];
            });

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
     * Check availability of a specific medicine.
     */
    public function checkAvailability(int $medicineId, Request $request): JsonResponse
    {
        try {
            $quantity = $request->query('quantity', 1);

            if (!is_numeric($quantity) || $quantity < 1) {
                return $this->errorResponse(
                    'Quantity must be a positive number',
                    null,
                    400
                );
            }

            $medicine = Medicament::with('pharmacy:id,name,address,is_on_duty')->find($medicineId);

            if (!$medicine) {
                return $this->errorResponse('Medicine not found', null, 404);
            }

            $isAvailable = $medicine->isAvailable($quantity);

            return $this->successResponse(
                'Medicine availability checked',
                [
                    'medicine' => [
                        'id' => $medicine->id,
                        'name' => $medicine->name,
                        'price' => $medicine->price,
                        'stock' => $medicine->stock,
                        'requires_prescription' => $medicine->requires_prescription,
                        'pharmacy' => [
                            'id' => $medicine->pharmacy->id,
                            'name' => $medicine->pharmacy->name,
                            'address' => $medicine->pharmacy->address,
                            'is_on_duty' => $medicine->pharmacy->is_on_duty,
                        ],
                    ],
                    'requested_quantity' => $quantity,
                    'is_available' => $isAvailable,
                    'available_quantity' => $medicine->stock,
                    'can_order' => $isAvailable,
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to check medicine availability',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get medicines by pharmacy (public view).
     */
    public function medicinesByPharmacy(int $pharmacyId, Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 20);
            $search = $request->query('search');
            $inStock = $request->query('in_stock', 'true');

            $query = Medicament::byPharmacy($pharmacyId);

            if ($search) {
                $query->search($search);
            }

            if ($inStock !== null) {
                $inStock = filter_var($inStock, FILTER_VALIDATE_BOOLEAN);
                if ($inStock) {
                    $query->inStock();
                }
            }

            $medicines = $query->orderBy('name', 'asc')->paginate($perPage);

            $medicines->getCollection()->transform(function ($medicine) {
                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'description' => $medicine->description,
                    'price' => $medicine->price,
                    'stock' => $medicine->stock,
                    'requires_prescription' => $medicine->requires_prescription,
                ];
            });

            return $this->successResponse(
                'Medicines by pharmacy retrieved successfully',
                [
                    'pharmacy_id' => $pharmacyId,
                    'medicines' => $medicines->items(),
                    'pagination' => [
                        'total' => $medicines->total(),
                        'per_page' => $medicines->perPage(),
                        'current_page' => $medicines->currentPage(),
                        'last_page' => $medicines->lastPage(),
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve medicines by pharmacy',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Search medicines across all pharmacies.
     */
    public function searchMedicines(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'query' => 'required|string|min:2|max:100',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            $perPage = $validated['per_page'] ?? 20;
            $query = $validated['query'];

            $medicines = Medicament::with('pharmacy:id,name,address,is_on_duty')
                ->search($query)
                ->inStock()
                ->orderBy('name', 'asc')
                ->paginate($perPage);

            $medicines->getCollection()->transform(function ($medicine) {
                return [
                    'id' => $medicine->id,
                    'name' => $medicine->name,
                    'description' => $medicine->description,
                    'price' => $medicine->price,
                    'stock' => $medicine->stock,
                    'requires_prescription' => $medicine->requires_prescription,
                    'pharmacy' => [
                        'id' => $medicine->pharmacy->id,
                        'name' => $medicine->pharmacy->name,
                        'address' => $medicine->pharmacy->address,
                        'is_on_duty' => $medicine->pharmacy->is_on_duty,
                    ],
                ];
            });

            return $this->successResponse(
                'Medicines search completed',
                [
                    'query' => $query,
                    'medicines' => $medicines->items(),
                    'pagination' => [
                        'total' => $medicines->total(),
                        'per_page' => $medicines->perPage(),
                        'current_page' => $medicines->currentPage(),
                        'last_page' => $medicines->lastPage(),
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to search medicines',
                ['error' => $e->getMessage()],
                500
            );
        }
    }
}
