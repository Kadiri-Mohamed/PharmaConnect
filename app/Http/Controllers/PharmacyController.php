<?php

namespace App\Http\Controllers;

use App\Models\Pharmacy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PharmacyController extends Controller
{
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
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving pharmacies',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
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
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving pharmacy',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
