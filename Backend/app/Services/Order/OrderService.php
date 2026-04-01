<?php

namespace App\Services\Order;

use App\Models\Commande;
use App\Models\CommandeItem;
use App\Models\User;
use App\Models\Panier;
use App\Services\Cart\CartService;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private CartService $cartService)
    {
    }

    /**
     * Create order(s) from cart with transaction support.
     * If cart contains items from multiple pharmacies, creates separate orders.
     *
     * @throws \Exception if cart is empty or stock validation fails
     */
    public function createOrderFromCart(User $user, array $data = []): array
    {
        return DB::transaction(function () use ($user, $data) {
            $panier = $this->cartService->getOrCreateCart($user);

            if ($panier->isEmpty()) {
                throw new \Exception('Cart is empty, cannot create order');
            }

            // Validate all items have sufficient stock
            $validation = $this->cartService->validateCartStock($user);
            if (!$validation['is_valid']) {
                throw new \Exception('Some items in cart are no longer available in the requested quantity');
            }

            $orders = [];
            $itemsByPharmacy = $this->groupItemsByPharmacy($panier);

            foreach ($itemsByPharmacy as $pharmacyId => $items) {
                $order = $this->createSingleOrder($user, $pharmacyId, $items, $data);
                $orders[] = $order;
            }

            // Clear cart after successful order creation
            $panier->clear();

            return [
                'orders' => $orders,
                'order_count' => count($orders),
                'total_amount' => array_sum(array_map(fn($o) => $o['total_price'], $orders)),
            ];
        });
    }

    /**
     * Create a single order for a specific pharmacy.
     */
    private function createSingleOrder(User $user, int $pharmacyId, array $items, array $data = []): array
    {
        $totalPrice = 0;
        $orderItems = [];

        // Create order record
        $order = Commande::create([
            'user_id' => $user->id,
            'pharmacy_id' => $pharmacyId,
            'status' => Commande::STATUS_PENDING,
            'delivery_type' => $data['delivery_type'] ?? 'pickup',
            'delivery_address' => $data['delivery_address'] ?? null,
            'notes' => $data['notes'] ?? null,
            'total_price' => 0, // Will update after creating items
        ]);

        // Create order items and reduce stock
        foreach ($items as $item) {
            $itemTotal = $item->quantity * $item->price;
            $totalPrice += $itemTotal;

            CommandeItem::create([
                'order_id' => $order->id,
                'medicine_id' => $item->medicine_id,
                'quantity' => $item->quantity,
                'price' => $item->price,
            ]);

            // Reduce medicine stock
            $item->medicament->reduceStock($item->quantity);

            $orderItems[] = [
                'medicine_id' => $item->medicine_id,
                'medicine_name' => $item->medicament->name,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'subtotal' => $itemTotal,
            ];
        }

        // Update order total price
        $order->update(['total_price' => $totalPrice]);

        return [
            'id' => $order->id,
            'user_id' => $order->user_id,
            'pharmacy_id' => $order->pharmacy_id,
            'pharmacy_name' => $order->pharmacy->name,
            'status' => $order->status,
            'total_price' => $order->total_price,
            'delivery_type' => $order->delivery_type,
            'delivery_address' => $order->delivery_address,
            'notes' => $order->notes,
            'item_count' => count($orderItems),
            'items' => $orderItems,
            'created_at' => $order->created_at,
        ];
    }

    /**
     * Group panier items by pharmacy.
     */
    private function groupItemsByPharmacy(Panier $panier): array
    {
        $grouped = [];

        $panier->itemsWithMedicament->each(function ($item) use (&$grouped) {
            $pharmacyId = $item->medicament->pharmacy_id;
            if (!isset($grouped[$pharmacyId])) {
                $grouped[$pharmacyId] = [];
            }
            $grouped[$pharmacyId][] = $item;
        });

        return $grouped;
    }

    /**
     * Get user's orders with pagination.
     */
    public function getUserOrders(User $user, int $perPage = 15): array
    {
        $orders = Commande::byUser($user->id)
            ->with('pharmacy', 'items.medicament')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return [
            'orders' => $orders->items(),
            'pagination' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'from' => $orders->firstItem(),
                'to' => $orders->lastItem(),
            ],
        ];
    }

    /**
     * Get single order details.
     */
    public function getOrder(User $user, int $orderId): ?array
    {
        $order = Commande::where('user_id', $user->id)
            ->with('pharmacy', 'items.medicament')
            ->find($orderId);

        if (!$order) {
            return null;
        }

        return $this->formatOrderResponse($order);
    }

    /**
     * Get orders for a pharmacy (pharmacist only).
     */
    public function getPharmacyOrders(int $pharmacyId, int $perPage = 15, ?string $status = null): array
    {
        $query = Commande::byPharmacy($pharmacyId)
            ->with('user', 'items.medicament')
            ->orderBy('created_at', 'desc');

        if ($status) {
            $query->byStatus($status);
        }

        $orders = $query->paginate($perPage);

        return [
            'orders' => $orders->items(),
            'pagination' => [
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
            ],
        ];
    }

    /**
     * Update order status (with transaction for consistency).
     */
    public function updateOrderStatus(int $orderId, string $newStatus): array
    {
        return DB::transaction(function () use ($orderId, $newStatus) {
            $order = Commande::find($orderId);

            if (!$order) {
                throw new \Exception('Order not found');
            }

            $validStatuses = [
                Commande::STATUS_PENDING,
                Commande::STATUS_PREPARING,
                Commande::STATUS_READY,
                Commande::STATUS_DELIVERED,
                Commande::STATUS_CANCELLED,
            ];

            if (!in_array($newStatus, $validStatuses)) {
                throw new \Exception('Invalid order status');
            }

            // Prevent certain status transitions
            if ($order->status === Commande::STATUS_DELIVERED) {
                throw new \Exception('Cannot modify a delivered order');
            }

            if ($order->status === Commande::STATUS_CANCELLED) {
                throw new \Exception('Cannot modify a cancelled order');
            }

            $oldStatus = $order->status;
            $order->updateStatus($newStatus);

            return [
                'id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $order->status,
                'updated_at' => $order->updated_at,
            ];
        });
    }

    /**
     * Cancel an order (refund items to pharmacy inventory).
     */
    public function cancelOrder(int $orderId): array
    {
        return DB::transaction(function () use ($orderId) {
            $order = Commande::with('items.medicament')->find($orderId);

            if (!$order) {
                throw new \Exception('Order not found');
            }

            if ($order->status === Commande::STATUS_DELIVERED) {
                throw new \Exception('Cannot cancel a delivered order');
            }

            if ($order->status === Commande::STATUS_CANCELLED) {
                throw new \Exception('Order is already cancelled');
            }

            // Restore stock for all items
            $order->items()->each(function (CommandeItem $item) {
                $item->medicament->increaseStock($item->quantity);
            });

            $order->update(['status' => Commande::STATUS_CANCELLED]);

            return [
                'id' => $order->id,
                'status' => $order->status,
                'message' => 'Order cancelled and stock restored',
            ];
        });
    }

    /**
     * Format order response with all details.
     */
    private function formatOrderResponse(Commande $order): array
    {
        $items = $order->itemsWithMedicament->map(function ($item) {
            return [
                'id' => $item->id,
                'medicine_id' => $item->medicine_id,
                'medicine_name' => $item->medicament->name,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'subtotal' => $item->getSubtotal(),
            ];
        })->toArray();

        return [
            'id' => $order->id,
            'user_id' => $order->user_id,
            'pharmacy_id' => $order->pharmacy_id,
            'pharmacy_name' => $order->pharmacy->name,
            'status' => $order->status,
            'total_price' => $order->total_price,
            'delivery_type' => $order->delivery_type,
            'delivery_address' => $order->delivery_address,
            'notes' => $order->notes,
            'item_count' => count($items),
            'items' => $items,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ];
    }

    /**
     * Get order statistics for a pharmacy.
     */
    public function getPharmacyStats(int $pharmacyId): array
    {
        return [
            'total_orders' => Commande::byPharmacy($pharmacyId)->count(),
            'pending_orders' => Commande::byPharmacy($pharmacyId)->pending()->count(),
            'preparing_orders' => Commande::byPharmacy($pharmacyId)->preparing()->count(),
            'ready_orders' => Commande::byPharmacy($pharmacyId)->ready()->count(),
            'delivered_orders' => Commande::byPharmacy($pharmacyId)->delivered()->count(),
            'cancelled_orders' => Commande::byPharmacy($pharmacyId)->byStatus(Commande::STATUS_CANCELLED)->count(),
        ];
    }
}
