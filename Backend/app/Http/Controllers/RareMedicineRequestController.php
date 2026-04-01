<?php

namespace App\Http\Controllers;

use App\Models\RareMedicineRequest;
use App\Http\Requests\RareMedicineRequest as RareMedicineRequestValidation;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RareMedicineRequestController extends Controller
{
    use ApiResponseTrait;

    /**
     * Create a new rare medicine request.
     * Accessible to both visitors (no auth) and authenticated clients.
     */
    public function store(RareMedicineRequestValidation $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Set user_id to null for visitors, or authenticated user's ID
            $user = auth('api')->user();
            $validated['user_id'] = $user ? $user->id : null;
            $validated['status'] = RareMedicineRequest::STATUS_PENDING;

            $rareRequest = RareMedicineRequest::create($validated);

            return $this->createdResponse(
                'Rare medicine request submitted successfully',
                [
                    'request' => [
                        'id' => $rareRequest->id,
                        'medicine_name' => $rareRequest->medicine_name,
                        'description' => $rareRequest->description,
                        'status' => $rareRequest->status,
                        'user_id' => $rareRequest->user_id,
                        'created_at' => $rareRequest->created_at,
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to submit rare medicine request',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get all rare medicine requests (pharmacist only).
     * Supports filtering by status and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();

            // Verify user is a pharmacist
            if (!$user || $user->role !== 'pharmacist') {
                return $this->errorResponse(
                    'Only pharmacists can view rare medicine requests',
                    null,
                    403
                );
            }

            $perPage = $request->query('per_page', 15);
            $status = $request->query('status');
            $search = $request->query('search');
            $sortBy = $request->query('sort_by', 'created_at');
            $sortOrder = $request->query('sort_order', 'desc');

            $query = RareMedicineRequest::with(['user:id,name,email']);

            // Status filter
            if ($status) {
                if (!in_array($status, [RareMedicineRequest::STATUS_PENDING, RareMedicineRequest::STATUS_ANSWERED])) {
                    return $this->errorResponse(
                        'Invalid status. Must be "pending" or "answered"',
                        null,
                        400
                    );
                }
                $query->byStatus($status);
            }

            // Search filter
            if ($search) {
                $query->search($search);
            }

            // Sorting
            $allowedSortFields = ['created_at', 'medicine_name', 'status'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $requests = $query->paginate($perPage);

            $requests->getCollection()->transform(function ($request) {
                return [
                    'id' => $request->id,
                    'medicine_name' => $request->medicine_name,
                    'description' => $request->description,
                    'status' => $request->status,
                    'user' => $request->user ? [
                        'id' => $request->user->id,
                        'name' => $request->user->name,
                        'email' => $request->user->email,
                    ] : null,
                    'created_at' => $request->created_at,
                    'updated_at' => $request->updated_at,
                ];
            });

            return $this->successResponse(
                'Rare medicine requests retrieved successfully',
                [
                    'requests' => $requests->items(),
                    'pagination' => [
                        'total' => $requests->total(),
                        'per_page' => $requests->perPage(),
                        'current_page' => $requests->currentPage(),
                        'last_page' => $requests->lastPage(),
                        'from' => $requests->firstItem(),
                        'to' => $requests->lastItem(),
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve rare medicine requests',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get a specific rare medicine request (pharmacist only).
     */
    public function show(int $id): JsonResponse
    {
        try {
            $user = auth('api')->user();

            // Verify user is a pharmacist
            if (!$user || $user->role !== 'pharmacist') {
                return $this->errorResponse(
                    'Only pharmacists can view rare medicine requests',
                    null,
                    403
                );
            }

            $request = RareMedicineRequest::with(['user:id,name,email'])->find($id);

            if (!$request) {
                return $this->errorResponse('Rare medicine request not found', null, 404);
            }

            return $this->successResponse(
                'Rare medicine request retrieved successfully',
                [
                    'request' => [
                        'id' => $request->id,
                        'medicine_name' => $request->medicine_name,
                        'description' => $request->description,
                        'status' => $request->status,
                        'user' => $request->user ? [
                            'id' => $request->user->id,
                            'name' => $request->user->name,
                            'email' => $request->user->email,
                        ] : null,
                        'created_at' => $request->created_at,
                        'updated_at' => $request->updated_at,
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve rare medicine request',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Update the status of a rare medicine request (pharmacist only).
     * Can only change status from pending to answered.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        try {
            $user = auth('api')->user();

            // Verify user is a pharmacist
            if (!$user || $user->role !== 'pharmacist') {
                return $this->errorResponse(
                    'Only pharmacists can update request status',
                    null,
                    403
                );
            }

            $validated = $request->validate([
                'status' => 'required|string|in:pending,answered',
            ]);

            $rareRequest = RareMedicineRequest::find($id);

            if (!$rareRequest) {
                return $this->errorResponse('Rare medicine request not found', null, 404);
            }

            // Prevent changing status from answered back to pending
            if ($rareRequest->status === RareMedicineRequest::STATUS_ANSWERED &&
                $validated['status'] === RareMedicineRequest::STATUS_PENDING) {
                return $this->errorResponse(
                    'Cannot change status from answered back to pending',
                    null,
                    409
                );
            }

            $oldStatus = $rareRequest->status;
            $rareRequest->update(['status' => $validated['status']]);

            return $this->successResponse(
                'Request status updated successfully',
                [
                    'request' => [
                        'id' => $rareRequest->id,
                        'medicine_name' => $rareRequest->medicine_name,
                        'old_status' => $oldStatus,
                        'new_status' => $rareRequest->status,
                        'updated_at' => $rareRequest->updated_at,
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to update request status',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get user's own rare medicine requests (authenticated users only).
     */
    public function myRequests(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();

            if (!$user) {
                return $this->errorResponse(
                    'Authentication required to view your requests',
                    null,
                    401
                );
            }

            $perPage = $request->query('per_page', 15);
            $status = $request->query('status');

            $query = RareMedicineRequest::byUser($user->id);

            if ($status) {
                if (!in_array($status, [RareMedicineRequest::STATUS_PENDING, RareMedicineRequest::STATUS_ANSWERED])) {
                    return $this->errorResponse(
                        'Invalid status. Must be "pending" or "answered"',
                        null,
                        400
                    );
                }
                $query->byStatus($status);
            }

            $requests = $query->orderBy('created_at', 'desc')->paginate($perPage);

            $requests->getCollection()->transform(function ($request) {
                return [
                    'id' => $request->id,
                    'medicine_name' => $request->medicine_name,
                    'description' => $request->description,
                    'status' => $request->status,
                    'created_at' => $request->created_at,
                    'updated_at' => $request->updated_at,
                ];
            });

            return $this->successResponse(
                'Your rare medicine requests retrieved successfully',
                [
                    'requests' => $requests->items(),
                    'pagination' => [
                        'total' => $requests->total(),
                        'per_page' => $requests->perPage(),
                        'current_page' => $requests->currentPage(),
                        'last_page' => $requests->lastPage(),
                        'from' => $requests->firstItem(),
                        'to' => $requests->lastItem(),
                    ],
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve your requests',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get statistics for rare medicine requests (pharmacist only).
     */
    public function statistics(): JsonResponse
    {
        try {
            $user = auth('api')->user();

            // Verify user is a pharmacist
            if (!$user || $user->role !== 'pharmacist') {
                return $this->errorResponse(
                    'Only pharmacists can view request statistics',
                    null,
                    403
                );
            }

            $stats = [
                'total_requests' => RareMedicineRequest::count(),
                'pending_requests' => RareMedicineRequest::pending()->count(),
                'answered_requests' => RareMedicineRequest::answered()->count(),
                'today_requests' => RareMedicineRequest::whereDate('created_at', today())->count(),
                'this_week_requests' => RareMedicineRequest::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
            ];

            return $this->successResponse(
                'Request statistics retrieved successfully',
                ['statistics' => $stats]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve statistics',
                ['error' => $e->getMessage()],
                500
            );
        }
    }
}
