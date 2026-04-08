<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Services\OrderServiceImproved;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class OrderController extends Controller
{
    /**
     * Constructor to inject service.
     *
     * @param OrderServiceImproved $orderService
     */
    public function __construct(private OrderServiceImproved $orderService) {}

    /**
     * Display a listing of user's orders.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $user = auth()->user();
            $orders = $this->orderService->getUserOrders($user);

            return response()->json([
                'message' => 'Orders retrieved successfully',
                'data' => $orders->map(fn ($order) => [
                    'id' => $order->id,
                    'pharmacy_id' => $order->pharmacy_id,
                    'pharmacy_name' => $order->pharmacy->name,
                    'status' => $order->status,
                    'total_price' => $order->total_price,
                    'item_count' => $order->items()->count(),
                    'created_at' => $order->created_at,
                ]),
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving orders',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created order from cart.
     *
     * @param StoreOrderRequest $request
     * @return JsonResponse
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $order = $this->orderService->createOrderFromCart(
                $user,
                $request->input('pharmacy_id')
            );

            return response()->json([
                'message' => 'Order created successfully',
                'data' => [
                    'id' => $order->id,
                    'user_id' => $order->user_id,
                    'pharmacy_id' => $order->pharmacy_id,
                    'status' => $order->status,
                    'total_price' => $order->total_price,
                    'created_at' => $order->created_at,
                ],
            ], Response::HTTP_CREATED);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while creating order',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified order.
     *
     * @param Order $order
     * @return JsonResponse
     */
    public function show(Order $order): JsonResponse
    {
        try {
            // Verify order belongs to authenticated user
            if ($order->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Unauthorized',
                ], Response::HTTP_FORBIDDEN);
            }

            $order->load(['pharmacy', 'items.medicament']);

            return response()->json([
                'message' => 'Order retrieved successfully',
                'data' => [
                    'id' => $order->id,
                    'user_id' => $order->user_id,
                    'pharmacy' => [
                        'id' => $order->pharmacy->id,
                        'name' => $order->pharmacy->name,
                        'address' => $order->pharmacy->address,
                        'phone' => $order->pharmacy->phone,
                    ],
                    'status' => $order->status,
                    'total_price' => $order->total_price,
                    'items' => $order->items->map(fn ($item) => [
                        'id' => $item->id,
                        'medicament_id' => $item->medicament_id,
                        'medicament_name' => $item->medicament->name,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->price * $item->quantity,
                    ]),
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                ],
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving order',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update the status of an order.
     *
     * @param \Illuminate\Http\Request $request
     * @param Order $order
     * @return JsonResponse
     */
    public function updateStatus(\Illuminate\Http\Request $request, Order $order): JsonResponse
    {
        try {
            // Verify order belongs to authenticated user or user is pharmacist
            if ($order->user_id !== auth()->id() && auth()->user()->role !== 'pharmacien') {
                return response()->json([
                    'message' => 'Unauthorized',
                ], Response::HTTP_FORBIDDEN);
            }

            $request->validate([
                'status' => ['required', 'string', 'in:pending,preparing,ready,delivered,cancelled'],
            ]);

            $order = $this->orderService->updateOrderStatus(
                $order,
                $request->input('status')
            );

            return response()->json([
                'message' => 'Order status updated successfully',
                'data' => [
                    'id' => $order->id,
                    'status' => $order->status,
                    'updated_at' => $order->updated_at,
                ],
            ], Response::HTTP_OK);
        } catch (DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating order status',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display pharmacist orders for the authenticated pharmacist pharmacy.
     */
    public function pharmacienOrders(): JsonResponse
    {
        try {
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

            $orders = Order::query()
                ->with([
                    'user:id,name,email',
                    'items:id,order_id,medicament_id,quantity,price',
                    'items.medicament:id,name',
                ])
                ->where('pharmacy_id', $user->pharmacy->id)
                ->latest()
                ->get();

            return response()->json([
                'message' => 'Orders retrieved successfully',
                'data' => $orders,
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving orders',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Backward-compatible alias for pharmacist order status updates.
     */
    public function updateOrderStatus(\Illuminate\Http\Request $request, Order $order): JsonResponse
    {
        return $this->updateStatus($request, $order);
    }
}
