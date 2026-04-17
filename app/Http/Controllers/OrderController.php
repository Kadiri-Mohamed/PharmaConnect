<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\OrderServiceImproved;
use DomainException;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(private OrderServiceImproved $orderService) {}

    public function index()
    {
        $orders = $this->orderService->getUserOrders(auth()->user())
            ->map(fn (Order $order) => $this->formatUserOrder($order))
            ->values();

        return Inertia::render('orders', [
            'orders' => $orders,
        ]);
    }

    public function store(StoreOrderRequest $request)
    {
        try {
            $order = $this->orderService->createOrderFromCart(
                $request->user(),
                $request->integer('pharmacy_id')
            );
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return to_route('orders.show', $order)->with('success', 'Order created successfully.');
    }

    public function show(Order $order)
    {
        abort_unless($order->user_id === auth()->id(), 403);

        $order->load(['pharmacy', 'prescription', 'items.medicament']);

        return Inertia::render('Orders/Show', [
            'order' => $this->formatOrderDetails($order),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $user = $request->user();

        if ($user->role === 'pharmacien') {
            abort_unless($user->pharmacy && $order->pharmacy_id === $user->pharmacy->id, 403);
        } else {
            abort_unless($order->user_id === $user->id, 403);
        }

        try {
            $this->orderService->updateOrderStatus(
                $order,
                $request->string('status')->toString()
            );
        } catch (DomainException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Order status updated.');
    }

    public function pharmacienOrders()
    {
        $pharmacy = auth()->user()->pharmacy;

        abort_unless($pharmacy, 403);

        $orders = Order::query()
            ->with([
                'user:id,name,email',
                'prescription:id,image,status',
                'items:id,order_id,medicament_id,quantity,price',
                'items.medicament:id,name',
            ])
            ->where('pharmacy_id', $pharmacy->id)
            ->latest()
            ->get()
            ->map(fn (Order $order) => $this->formatPharmacistOrder($order))
            ->values();

        return Inertia::render('pharmacien/manage-orders', [
            'orders' => $orders,
        ]);
    }

    private function formatUserOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'pharmacy_id' => $order->pharmacy_id,
            'pharmacy_name' => $order->pharmacy?->name,
            'prescription_id' => $order->prescription_id,
            'prescription_status' => $order->prescription?->status,
            'status' => $order->status,
            'total_price' => $order->total_price,
            'item_count' => $order->items->count(),
            'created_at' => $order->created_at,
        ];
    }

    private function formatOrderDetails(Order $order): array
    {
        return [
            'id' => $order->id,
            'user_id' => $order->user_id,
            'status' => $order->status,
            'total_price' => $order->total_price,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'pharmacy' => [
                'id' => $order->pharmacy->id,
                'name' => $order->pharmacy->name,
                'address' => $order->pharmacy->address,
                'phone' => $order->pharmacy->phone,
            ],
            'prescription' => $order->prescription ? [
                'id' => $order->prescription->id,
                'status' => $order->prescription->status,
                'file_url' => route('prescriptions.file', $order->prescription),
            ] : null,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'medicament_id' => $item->medicament_id,
                'medicament_name' => $item->medicament?->name,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'subtotal' => $item->price * $item->quantity,
            ])->values(),
        ];
    }

    private function formatPharmacistOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'user_id' => $order->user_id,
            'pharmacy_id' => $order->pharmacy_id,
            'status' => $order->status,
            'total_price' => $order->total_price,
            'created_at' => $order->created_at,
            'user' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
            ] : null,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'medicament_id' => $item->medicament_id,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'medicament' => $item->medicament ? [
                    'name' => $item->medicament->name,
                ] : null,
            ])->values(),
            'prescription' => $order->prescription ? [
                'id' => $order->prescription->id,
                'status' => $order->prescription->status,
                'file_url' => route('prescriptions.file', $order->prescription),
            ] : null,
        ];
    }
}
