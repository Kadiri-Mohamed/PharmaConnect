<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Constructor to inject dependencies.
     *
     * @param CartService $cartService
     * @param MedicamentService $medicamentService
     */
    public function __construct(
        private CartService $cartService,
        private MedicamentService $medicamentService,
    ) {}

    /**
     * Create an order from the user's cart.
     *
     * @param User $user
     * @param int $pharmacyId
     * @return Order
     * @throws DomainException
     */
    public function createOrderFromCart(User $user, int $pharmacyId): Order
    {
        return DB::transaction(function () use ($user, $pharmacyId) {
            $cart = $user->cart;

            // Validate user has a cart
            if (!$cart) {
                throw new DomainException('User does not have a cart');
            }

            // Load cart items with medicament eager loaded (only once for performance)
            $cartItems = $cart->items()->with('medicament')->get();

            // Validate cart is not empty
            if ($cartItems->isEmpty()) {
                throw new DomainException('Cannot create order from an empty cart');
            }

            // Validate all cart items belong to the same pharmacy
            $this->validateCartPharmacyItems($cartItems, $pharmacyId);

            // Calculate total price from loaded items
            $totalPrice = $this->calculateCartTotal($cartItems);

            // Create the order
            $order = Order::create([
                'user_id' => $user->id,
                'pharmacy_id' => $pharmacyId,
                'status' => 'pending',
                'total_price' => $totalPrice,
            ]);

            // Create order items and decrease stock
            $this->createOrderItemsWithStockDecrease($order, $cartItems);

            // Clear the cart
            $this->cartService->clearCart($cart);

            return $order;
        });
    }

    /**
     * Validate that all cart items belong to the specified pharmacy.
     *
     * @param Collection $cartItems
     * @param int $pharmacyId
     * @return void
     * @throws DomainException
     */
    private function validateCartPharmacyItems(Collection $cartItems, int $pharmacyId): void
    {
        $invalidItems = $cartItems->filter(function ($item) use ($pharmacyId) {
            return $item->medicament->pharmacy_id !== $pharmacyId;
        });

        if ($invalidItems->isNotEmpty()) {
            throw new DomainException(
                'Cart contains items from different pharmacies. All items must be from the same pharmacy.'
            );
        }
    }

    /**
     * Calculate the total price of cart items.
     *
     * @param Collection $cartItems
     * @return float
     */
    private function calculateCartTotal(Collection $cartItems): float
    {
        return $cartItems->sum(function ($item) {
            return $item->medicament->price * $item->quantity;
        });
    }

    /**
     * Create order items and decrease stock for each item.
     *
     * @param Order $order
     * @param Collection $cartItems
     * @return void
     * @throws DomainException
     */
    private function createOrderItemsWithStockDecrease(Order $order, Collection $cartItems): void
    {
        $cartItems->each(function ($cartItem) use ($order) {
            $medicament = $cartItem->medicament;

            // Decrease stock for the medicament
            $this->medicamentService->decreaseStock($medicament, $cartItem->quantity);

            // Create order item
            OrderItem::create([
                'order_id' => $order->id,
                'medicament_id' => $medicament->id,
                'quantity' => $cartItem->quantity,
                'price' => $medicament->price,
            ]);
        });
    }

    /**
     * Update the status of an order.
     *
     * @param Order $order
     * @param string $status
     * @return Order
     */
    public function updateOrderStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);
        return $order->fresh();
    }

    /**
     * Calculate the total price of an order.
     *
     * @param Order $order
     * @return float
     */
    public function calculateTotalPrice(Order $order): float
    {
        return $order->items()
            ->get()
            ->sum(function (OrderItem $item) {
                return $item->price * $item->quantity;
            });
    }

    /**
     * Cancel an order.
     *
     * @param Order $order
     * @return Order
     */
    public function cancelOrder(Order $order): Order
    {
        return $this->updateOrderStatus($order, 'cancelled');
    }

    /**
     * Get orders by status.
     *
     * @param string $status
     * @return Collection
     */
    public function getOrdersByStatus(string $status): Collection
    {
        return Order::where('status', $status)
            ->with(['user', 'pharmacy', 'items'])
            ->get();
    }

    /**
     * Get orders for a specific user.
     *
     * @param User $user
     * @return Collection
     */
    public function getUserOrders(User $user): Collection
    {
        return $user->orders()
            ->with(['pharmacy', 'items.medicament'])
            ->latest()
            ->get();
    }
}
