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
            $requests = RareRequest::paginate(15);

            return response()->json([
                'message' => 'Rare requests retrieved successfully',
                'data' => $requests->items(),
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
            ]);

            return response()->json([
                'message' => 'Rare request created successfully',
                'data' => [
                    'id' => $rareRequest->id,
                    'medicine_name' => $rareRequest->medicine_name,
                    'description' => $rareRequest->description,
                    'status' => $rareRequest->status,
                    'created_at' => $rareRequest->created_at,
                ],
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
            if (! auth()->user() || auth()->user()->role !== 'pharmacien') {
                return response()->json([
                    'message' => 'Unauthorized',
                ], Response::HTTP_FORBIDDEN);
            }

            $rareRequest->update([
                'status' => $request->input('status'),
            ]);

            return response()->json([
                'message' => 'Rare request status updated successfully',
                'data' => [
                    'id' => $rareRequest->id,
                    'medicine_name' => $rareRequest->medicine_name,
                    'status' => $rareRequest->status,
                    'updated_at' => $rareRequest->updated_at,
                ],
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating rare request status',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
