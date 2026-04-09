<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class OrderServiceImproved
{
    /**
     * Constructor with improved service dependencies.
     */
    public function __construct(
        private CartService $cartService,
        private InventoryManager $inventoryManager,
        private StockValidator $stockValidator,
    ) {}

    /**
     * Create an order from user's cart with full validation and safe stock management.
     *
     * @param User $user
     * @param int $pharmacyId
     * @return Order
     * @throws DomainException
     */
    public function createOrderFromCart(User $user, int $pharmacyId): Order
    {
        return DB::transaction(function () use ($user, $pharmacyId) {
            // Step 1: Validate cart exists and has items
            $cart = $user->cart;
            if (!$cart) {
                throw new DomainException('User does not have a cart');
            }

            // Load cart items with relationships once
            $cartItems = $cart->items()->with('medicament')->get();

            if ($cartItems->isEmpty()) {
                throw new DomainException('Cannot create order from empty cart');
            }

            // Step 2: Validate all cart items
            $this->stockValidator->validatePharmacyConsistency($cartItems, $pharmacyId);
            $this->stockValidator->validateCollectionAvailability($cartItems);
            $this->stockValidator->validatePrescriptionRequirements($cartItems, $user);

            // Step 3: Calculate total (use database aggregation if possible)
            $totalPrice = $this->calculateOrderTotal($cartItems);
            $requiresPrescription = $cartItems->contains(
                fn ($item) => (bool) $item->medicament->requires_prescription
            );
            $prescriptionId = null;

            if ($requiresPrescription) {
                $prescriptionId = $user->prescriptions()
                    ->whereIn('status', ['pending', 'validated'])
                    ->latest()
                    ->value('id');
            }

            // Step 4: Create order
            $order = Order::create([
                'user_id' => $user->id,
                'pharmacy_id' => $pharmacyId,
                'prescription_id' => $prescriptionId,
                'status' => 'pending',
                'total_price' => $totalPrice,
            ]);

            // Step 5: Create order items and decrease stock safely
            $this->createOrderItemsAndDecreaseStock($order, $cartItems);

            // Step 6: Clear cart
            $this->cartService->clearCart($cart);

            return $order;
        });
    }

    /**
     * Create order items and decrease stock with pessimistic locking.
     *
     * @param Order $order
     * @param Collection $cartItems
     * @return void
     * @throws DomainException
     */
    private function createOrderItemsAndDecreaseStock(Order $order, Collection $cartItems): void
    {
        foreach ($cartItems as $item) {
            // Use safe stock decrease with pessimistic locking
            $medicament = $this->inventoryManager->decreaseStockSafely(
                $item->medicament,
                $item->quantity
            );

            // Create order item with final price
            $order->items()->create([
                'medicament_id' => $medicament->id,
                'quantity' => $item->quantity,
                'price' => $medicament->price,
            ]);
        }
    }

    /**
     * Calculate order total using database aggregation.
     *
     * @param Collection $cartItems
     * @return float
     */
    private function calculateOrderTotal(Collection $cartItems): float
    {
        return $cartItems->sum(function ($item) {
            return $item->medicament->price * $item->quantity;
        });
    }

    /**
     * Get user's orders with optimized queries.
     *
     * @param User $user
     * @return Collection
     */
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

    /**
     * Update order status with validation.
     *
     * @param Order $order
     * @param string $status
     * @return Order
     * @throws DomainException
     */
    public function updateOrderStatus(Order $order, string $status): Order
    {
        $validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];

        if (!in_array($status, $validStatuses, true)) {
            throw new DomainException("Invalid status: {$status}");
        }

        $order->update(['status' => $status]);
        return $order->refresh();
    }

    /**
     * Cancel order and restore stock.
     *
     * @param Order $order
     * @return Order
     * @throws DomainException
     */
    public function cancelOrderAndRestoreStock(Order $order): Order
    {
        return DB::transaction(function () use ($order) {
            if ($order->status === 'delivered') {
                throw new DomainException('Cannot cancel delivered order');
            }

            // Restore stock for all order items
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
