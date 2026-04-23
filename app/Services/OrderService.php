<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private CartService $cartService,
        private InventoryManager $inventoryManager,
    ) {}

    public function createOrderFromCart(User $user, int $pharmacyId): Order
    {
        return DB::transaction(function () use ($user, $pharmacyId) {
            $cart = $user->cart;
            $prescription = null;
            
            if (!$cart) {
                throw new Exception('Cart not found');
            }
            
            $cartItems = $cart->items()->with('medicament')->get();
            
            if ($cartItems->isEmpty()) {
                throw new Exception('Cart is empty');
            }
            
            foreach ($cartItems as $item) {
                if ($item->medicament->pharmacy_id !== $pharmacyId) {
                    throw new Exception('All items must be from the same pharmacy');
                }
            }
            
            foreach ($cartItems as $item) {
                if ($item->medicament->stock < $item->quantity) {
                    throw new Exception("Insufficient stock for {$item->medicament->name}");
                }
            }
            
            $needsPrescription = false;
            foreach ($cartItems as $item) {
                if ($item->medicament->requires_prescription) {
                    $needsPrescription = true;
                    break;
                }
            }
            
            if ($needsPrescription) {
                $prescription = $user->prescriptions()
                    ->whereIn('status', ['pending', 'validated'])
                    ->doesntHave('orders')
                    ->latest('id')
                    ->first();

                if (!$prescription) {
                    throw new Exception('Prescription required for some items');
                }
            }
            
            $totalPrice = 0;
            foreach ($cartItems as $item) {
                $totalPrice = $totalPrice + ($item->medicament->price * $item->quantity);
            }
            
            $order = Order::create([
                'user_id' => $user->id,
                'pharmacy_id' => $pharmacyId,
                'prescription_id' => $prescription?->id,
                'status' => 'pending',
                'total_price' => $totalPrice,
            ]);
            
            foreach ($cartItems as $item) {
                $medicament = $this->inventoryManager->decreaseStock($item->medicament, $item->quantity);
                
                $order->items()->create([
                    'medicament_id' => $medicament->id,
                    'quantity' => $item->quantity,
                    'price' => $medicament->price,
                ]);
            }
            
            $this->cartService->clearCart($cart);
            
            return $order;
        });
    }

    public function cancelOrder(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            if ($order->status === 'delivered') {
                throw new Exception('Cannot cancel delivered order');
            }
            
            $items = $order->items;
            foreach ($items as $item) {
                $this->inventoryManager->increaseStock($item->medicament, $item->quantity);
            }
            
            $order->update(['status' => 'cancelled']);
            return $order->fresh();
        });
    }

    public function updateOrderStatus(Order $order, string $status): Order
    {
        $validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
        
        $isValid = false;
        foreach ($validStatuses as $validStatus) {
            if ($status === $validStatus) {
                $isValid = true;
                break;
            }
        }
        
        if (!$isValid) {
            throw new Exception("Invalid status: {$status}");
        }
        
        $order->update(['status' => $status]);
        return $order->fresh();
    }

    public function getUserOrders(User $user)
    {
        return $user->orders()->with(['pharmacy', 'prescription', 'items.medicament'])->latest()->get();
    }
}
