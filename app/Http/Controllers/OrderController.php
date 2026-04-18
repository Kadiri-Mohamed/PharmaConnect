<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function index()
    {
        $orders = $this->orderService->getUserOrders(auth()->user());
        
        $formattedOrders = [];
        foreach ($orders as $order) {
            $formattedOrders[] = [
                'id' => $order->id,
                'pharmacy_name' => $order->pharmacy?->name,
                'status' => $order->status,
                'total_price' => $order->total_price,
                'created_at' => $order->created_at,
                'item_count' => count($order->items),
            ];
        }
        
        return Inertia::render('orders', [
            'orders' => $formattedOrders,
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'pharmacy_id' => ['required', 'exists:pharmacies,id'],
        ]);

        $pharmacyId = $request['pharmacy_id'];
        
        try {
            $order = $this->orderService->createOrderFromCart(
                $request->user(),
                $pharmacyId
            );
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
        
        return to_route('orders.show', $order)->with('success', 'Order created successfully.');
    }
    
    public function show(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }
        
        $order->load(['pharmacy', 'prescription', 'items.medicament']);
        
        $orderItems = [];
        foreach ($order->items as $item) {
            $orderItems[] = [
                'medicament_name' => $item->medicament->name,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'subtotal' => $item->price * $item->quantity,
            ];
        }
        
        return Inertia::render('Orders/Show', [
            'order' => [
                'id' => $order->id,
                'status' => $order->status,
                'total_price' => $order->total_price,
                'created_at' => $order->created_at,
                'pharmacy' => [
                    'name' => $order->pharmacy->name,
                    'address' => $order->pharmacy->address,
                    'phone' => $order->pharmacy->phone,
                ],
                'prescription' => $order->prescription ? [
                    'id' => $order->prescription->id,
                    'status' => $order->prescription->status,
                ] : null,
                'items' => $orderItems,
            ],
        ]);
    }
    
    public function updateStatus(Request $request, Order $order)
    {
        $user = $request->user();
        
        if ($user->role === 'pharmacien') {
            if (!$user->pharmacy || $order->pharmacy_id !== $user->pharmacy->id) {
                abort(403);
            }
        } else {
            if ($order->user_id !== $user->id) {
                abort(403);
            }
        }
        
        $request->validate([
            'status' => ['required', 'in:pending,preparing,ready,delivered,cancelled'],
        ]);

        $status = $request['status'];
        
        try {
            $this->orderService->updateOrderStatus($order, $status);
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
        
        return back()->with('success', 'Order status updated.');
    }
    
    public function pharmacienOrders()
    {
        $pharmacy = auth()->user()->pharmacy;
        
        if (!$pharmacy) {
            abort(403);
        }
        
        $orders = Order::where('pharmacy_id', $pharmacy->id)->with(['user', 'prescription', 'items.medicament'])->latest()->get();
        
        $formattedOrders = [];
        foreach ($orders as $order) {
            $items = [];
            foreach ($order->items as $item) {
                $items[] = [
                    'name' => $item->medicament->name,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ];
            }
            
            $formattedOrders[] = [
                'id' => $order->id,
                'user_name' => $order->user->name,
                'status' => $order->status,
                'total_price' => $order->total_price,
                'created_at' => $order->created_at,
                'prescription' => $order->prescription,
                'items' => $items,
            ];
        }
        
        return Inertia::render('pharmacien/orders', [
            'orders' => $formattedOrders,
        ]);
    }
}
