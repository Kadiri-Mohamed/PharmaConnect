<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRareRequestRequest;
use App\Http\Requests\UpdateRareRequestStatusRequest;
use App\Models\RareRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class RareRequestController extends Controller
{
    /**
     * Display a listing of rare requests.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $requests = RareRequest::with('foundByPharmacy.user')
                ->latest()
                ->paginate(15);

            return response()->json([
                'message' => 'Rare requests retrieved successfully',
                'data' => array_map(
                    fn (RareRequest $rareRequest) => $this->serializeRareRequest($rareRequest),
                    $requests->items()
                ),
                'pagination' => [
                    'current_page' => $requests->currentPage(),
                    'total' => $requests->total(),
                    'per_page' => $requests->perPage(),
                    'last_page' => $requests->lastPage(),
                ],
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving rare requests',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created rare request.
     *
     * @return JsonResponse
     */
    public function store(StoreRareRequestRequest $request): JsonResponse
    {
        try {
            $rareRequest = RareRequest::create([
                'medicine_name' => $request->input('medicine_name'),
                'description' => $request->input('description'),
                'status' => 'pending',
                'found_by_pharmacy_id' => null,
            ]);

            return response()->json([
                'message' => 'Rare request created successfully',
                'data' => $this->serializeRareRequest($rareRequest),
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating rare request',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the status of a rare request.
     *
     * @param RareRequest $rareRequest
     * @return JsonResponse
     */
    public function updateStatus(UpdateRareRequestStatusRequest $request, RareRequest $rareRequest): JsonResponse
    {
        try {
            $user = $request->user();

            if (! $user || $user->role !== 'pharmacien') {
                return response()->json([
                    'message' => 'Unauthorized',
                ], Response::HTTP_FORBIDDEN);
            }

            $status = $request->input('status');
            $pharmacy = $user->pharmacy;

            if ($status === 'found' && ! $pharmacy) {
                return response()->json([
                    'message' => 'Create your pharmacy profile before marking a request as found.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $rareRequest->update([
                'status' => $status,
                'found_by_pharmacy_id' => $status === 'found' ? $pharmacy?->id : null,
            ]);

            return response()->json([
                'message' => 'Rare request status updated successfully',
                'data' => $this->serializeRareRequest($rareRequest->fresh()),
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating rare request status',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Transform a rare request for API responses.
     *
     * @return array<string, mixed>
     */
    private function serializeRareRequest(RareRequest $rareRequest): array
    {
        $rareRequest->loadMissing('foundByPharmacy.user');

        $pharmacy = $rareRequest->foundByPharmacy;

        return [
            'id' => $rareRequest->id,
            'medicine_name' => $rareRequest->medicine_name,
            'description' => $rareRequest->description,
            'status' => $rareRequest->status,
            'created_at' => $rareRequest->created_at,
            'updated_at' => $rareRequest->updated_at,
            'found_by_pharmacy' => $pharmacy ? [
                'id' => $pharmacy->id,
                'name' => $pharmacy->name,
                'address' => $pharmacy->address,
                'phone' => $pharmacy->phone,
                'status_garde' => $pharmacy->status_garde,
                'pharmacist' => $pharmacy->user ? [
                    'id' => $pharmacy->user->id,
                    'name' => $pharmacy->user->name,
                    'email' => $pharmacy->user->email,
                ] : null,
            ] : null,
        ];
    }
}
