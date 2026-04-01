<?php

namespace App\Http\Controllers;

use App\Services\Order\OrderService;
use App\Http\Requests\OrderRequest;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private OrderService $orderService)
    {
    }

    /**
     * Create order(s) from user's cart.
     * If cart has items from multiple pharmacies, creates separate orders.
     */
    public function store(OrderRequest $request): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $validated = $request->validated();

            $result = $this->orderService->createOrderFromCart($user, $validated);

            return $this->createdResponse(
                count($result['orders']) > 1
                    ? 'Orders created successfully from multiple pharmacies'
                    : 'Order created successfully',
                ['orders' => $result['orders'], 'order_count' => $result['order_count']]
            );
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'empty') ? 400 : 422;
            return $this->errorResponse(
                'Failed to create order',
                ['error' => $e->getMessage()],
                $statusCode
            );
        }
    }

    /**
     * Get authenticated user's orders with pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $perPage = $request->query('per_page', 15);

            $result = $this->orderService->getUserOrders($user, $perPage);

            return $this->successResponse(
                'Orders retrieved successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve orders',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get single order details.
     */
    public function show(int $orderId): JsonResponse
    {
        try {
            $user = auth('api')->user();
            $order = $this->orderService->getOrder($user, $orderId);

            if (!$order) {
                return $this->errorResponse('Order not found', null, 404);
            }

            return $this->successResponse(
                'Order retrieved successfully',
                ['order' => $order]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve order',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Update order status (pharmacist only).
     * Valid transitions:
     * pending → preparing → ready → delivered
     * Any status → cancelled
     */
    public function updateStatus(Request $request, int $orderId): JsonResponse
    {
        try {
            $user = auth('api')->user();

            // Verify user is a pharmacist
            if ($user->role !== 'pharmacist') {
                return $this->errorResponse(
                    'Only pharmacists can update order status',
                    null,
                    403
                );
            }

            $validated = $request->validate([
                'status' => 'required|string|in:pending,preparing,ready,delivered,cancelled',
            ]);

            $result = $this->orderService->updateOrderStatus($orderId, $validated['status']);

            return $this->successResponse(
                'Order status updated successfully',
                ['order' => $result]
            );
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'not found') ? 404 : 409;
            return $this->errorResponse(
                'Failed to update order status',
                ['error' => $e->getMessage()],
                $statusCode
            );
        }
    }

    /**
     * Cancel an order (restore items to inventory).
     * Can only cancel orders that haven't been delivered.
     */
    public function cancel(int $orderId): JsonResponse
    {
        try {
            $user = auth('api')->user();

            // Verify user owns the order or is a pharmacist
            $order = \App\Models\Commande::find($orderId);
            if (!$order) {
                return $this->errorResponse('Order not found', null, 404);
            }

            $isOwner = $order->user_id === $user->id;
            $isPharmacist = $user->role === 'pharmacist' && $order->pharmacy_id === $user->pharmacy?->id;

            if (!$isOwner && !$isPharmacist) {
                return $this->errorResponse(
                    'You are not authorized to cancel this order',
                    null,
                    403
                );
            }

            $result = $this->orderService->cancelOrder($orderId);

            return $this->successResponse(
                'Order cancelled successfully',
                ['order' => $result]
            );
        } catch (\Exception $e) {
            $statusCode = str_contains($e->getMessage(), 'not found') ? 404 : 409;
            return $this->errorResponse(
                'Failed to cancel order',
                ['error' => $e->getMessage()],
                $statusCode
            );
        }
    }

    /**
     * Get orders for pharmacist's pharmacy (pharmacist only).
     */
    public function pharmacyOrders(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();

            // Verify user is a pharmacist with a pharmacy
            if ($user->role !== 'pharmacist' || !$user->pharmacy) {
                return $this->errorResponse(
                    'Only pharmacists can view pharmacy orders',
                    null,
                    403
                );
            }

            $perPage = $request->query('per_page', 15);
            $status = $request->query('status');

            $result = $this->orderService->getPharmacyOrders(
                $user->pharmacy->id,
                $perPage,
                $status
            );

            return $this->successResponse(
                'Pharmacy orders retrieved successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve pharmacy orders',
                ['error' => $e->getMessage()],
                500
            );
        }
    }

    /**
     * Get order statistics for pharmacist's pharmacy (pharmacist only).
     */
    public function pharmacyStatistics(): JsonResponse
    {
        try {
            $user = auth('api')->user();

            if ($user->role !== 'pharmacist' || !$user->pharmacy) {
                return $this->errorResponse(
                    'Only pharmacists can view pharmacy statistics',
                    null,
                    403
                );
            }

            $stats = $this->orderService->getPharmacyStats($user->pharmacy->id);

            return $this->successResponse(
                'Pharmacy statistics retrieved successfully',
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

    /**
     * Get orders by status (for user or pharmacist).
     */
    public function byStatus(Request $request): JsonResponse
    {
        try {
            $user = auth('api')->user();

            $validated = $request->validate([
                'status' => 'required|string|in:pending,preparing,ready,delivered,cancelled',
            ]);

            if ($user->role === 'pharmacist' && $user->pharmacy) {
                // Pharmacist views orders by pharmacy
                $result = $this->orderService->getPharmacyOrders(
                    $user->pharmacy->id,
                    $request->query('per_page', 15),
                    $validated['status']
                );
            } else {
                // Customer views own orders by status
                $orders = \App\Models\Commande::byUser($user->id)
                    ->byStatus($validated['status'])
                    ->with('pharmacy', 'items.medicament')
                    ->orderBy('created_at', 'desc')
                    ->paginate($request->query('per_page', 15));

                $result = [
                    'orders' => $orders->items(),
                    'pagination' => [
                        'total' => $orders->total(),
                        'per_page' => $orders->perPage(),
                        'current_page' => $orders->currentPage(),
                        'last_page' => $orders->lastPage(),
                    ],
                ];
            }

            return $this->successResponse(
                'Orders filtered by status',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve orders by status',
                ['error' => $e->getMessage()],
                500
            );
        }
    }
}
