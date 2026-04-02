<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMedicamentRequest;
use App\Http\Requests\UpdateMedicamentRequest;
use App\Models\Medicament;
use App\Services\MedicamentService;
use DomainException;
use Illuminate\Http\JsonResponse;
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
        try {
            $medicament = Medicament::create($request->validated());

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
}
