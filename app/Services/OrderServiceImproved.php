<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class OrderServiceImproved
{
    public function __construct(
        private CartService $cartService,
        private InventoryManager $inventoryManager,
        private StockValidator $stockValidator,
    ) {}

    public function createOrderFromCart(User $user, int $pharmacyId): Order
    {
        return DB::transaction(function () use ($user, $pharmacyId) {
            $cart = $user->cart;
            if (! $cart) {
                throw new DomainException('User does not have a cart');
            }

            $cartItems = $cart->items()->with('medicament')->get();

            if ($cartItems->isEmpty()) {
                throw new DomainException('Cannot create order from empty cart');
            }

            $this->stockValidator->validatePharmacyConsistency($cartItems, $pharmacyId);
            $this->stockValidator->validateCollectionAvailability($cartItems);
            $this->stockValidator->validatePrescriptionRequirements($cartItems, $user);

            $totalPrice = $this->calculateOrderTotal($cartItems);
            $requiresPrescription = $cartItems->contains(
                fn ($item) => (bool) $item->medicament->requires_prescription
            );
            $prescriptionId = null;

            if ($requiresPrescription) {
                $prescriptionId = $user->prescriptions()
                    ->whereIn('status', ['pending', 'validated'])
                    ->doesntHave('orders')
                    ->latest()
                    ->value('id');
            }

            $order = Order::create([
                'user_id' => $user->id,
                'pharmacy_id' => $pharmacyId,
                'prescription_id' => $prescriptionId,
                'status' => 'pending',
                'total_price' => $totalPrice,
            ]);

            $this->createOrderItemsAndDecreaseStock($order, $cartItems);

            $this->cartService->clearCart($cart);

            return $order;
        });
    }

    private function createOrderItemsAndDecreaseStock(Order $order, Collection $cartItems): void
    {
        foreach ($cartItems as $item) {
            $medicament = $this->inventoryManager->decreaseStockSafely(
                $item->medicament,
                $item->quantity
            );

            $order->items()->create([
                'medicament_id' => $medicament->id,
                'quantity' => $item->quantity,
                'price' => $medicament->price,
            ]);
        }
    }

    private function calculateOrderTotal(Collection $cartItems): float
    {
        return $cartItems->sum(function ($item) {
            return $item->medicament->price * $item->quantity;
        });
    }

    public function getUserOrders(User $user): Collection
    {
        return $user->orders()
            ->with([
                'pharmacy:id,name,address,phone',
                'prescription:id,status',
                'items:id,order_id,medicament_id,quantity,price',
                'items.medicament:id,name',
            ])
            ->latest()
            ->get();
    }

    public function updateOrderStatus(Order $order, string $status): Order
    {
        $validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

        if (!in_array($status, $validStatuses, true)) {
            throw new DomainException("Invalid status: {$status}");
        }

        $order->update(['status' => $status]);
        return $order->refresh();
    }

    public function cancelOrderAndRestoreStock(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            if ($order->status === 'delivered') {
                throw new DomainException('Cannot cancel delivered order');
            }

            foreach ($order->items as $item) {
                $this->inventoryManager->increaseStockSafely(
                    $item->medicament,
                    $item->quantity
                );
            }

            return $this->updateOrderStatus($order, 'cancelled');
        });
    }
}
