<?php

namespace App\Services\Cart;

use App\Models\Panier;
use App\Models\User;
use App\Models\Medicament;

class CartService
{
    /**
     * Get or create cart for user (each user has ONE cart).
     */
    public function getOrCreateCart(User $user): Panier
    {
        return $user->panier() ?? Panier::firstOrCreate(
            ['user_id' => $user->id],
            ['total_price' => 0]
        );
    }

    /**
     * Get current cart with all items and medicament details.
     */
    public function getCart(User $user): ?Panier
    {
        return $user->panier()->with('items.medicament')->first();
    }

    /**
     * Get cart with formatted response data.
     */
    public function getCartWithDetails(User $user): array
    {
        $panier = $this->getOrCreateCart($user);
        $panier->updateTotal();

        return [
            'id' => $panier->id,
            'user_id' => $panier->user_id,
            'total_price' => $panier->total_price,
            'item_count' => $panier->getItemCount(),
            'is_empty' => $panier->isEmpty(),
            'items' => $panier->itemsWithMedicament->map(function ($item) {
                return [
                    'id' => $item->id,
                    'medicine_id' => $item->medicine_id,
                    'quantity' => $item->quantity,
                    'item_price' => $item->price,
                    'subtotal' => $item->getSubtotal(),
                    'medicament' => [
                        'id' => $item->medicament->id,
                        'name' => $item->medicament->name,
                        'description' => $item->medicament->description,
                        'price' => $item->medicament->price,
                        'stock' => $item->medicament->stock,
                        'requires_prescription' => $item->medicament->requires_prescription,
                        'pharmacy_id' => $item->medicament->pharmacy_id,
                    ],
                ];
            })->toArray(),
            'created_at' => $panier->created_at,
            'updated_at' => $panier->updated_at,
        ];
    }

    /**
     * Add item to cart (or update quantity if exists).
     *
     * @throws \Exception if medicine not found or out of stock
     */
    public function addItem(User $user, int $medicineId, int $quantity): array
    {
        $panier = $this->getOrCreateCart($user);
        $medicament = Medicament::find($medicineId);

        if (!$medicament) {
            throw new \Exception('Medicine not found');
        }

        if (!$medicament->isAvailable($quantity)) {
            throw new \Exception(
                "Insufficient stock. Available: {$medicament->stock}, Requested: {$quantity}"
            );
        }

        // Add or update item in cart
        $item = $panier->addOrUpdateItem(
            $medicineId,
            $quantity,
            (float) $medicament->price
        );

        // Update total price
        $panier->updateTotal();

        return [
            'id' => $item->id,
            'medicine_id' => $item->medicine_id,
            'quantity' => $item->quantity,
            'item_price' => $item->price,
            'subtotal' => $item->getSubtotal(),
            'message' => $item->quantity === $quantity 
                ? 'Item added to cart' 
                : 'Item quantity updated',
        ];
    }

    /**
     * Update item quantity in cart.
     *
     * @throws \Exception if item not found or medicine out of stock
     */
    public function updateItemQuantity(User $user, int $itemId, int $newQuantity): array
    {
        $panier = $this->getOrCreateCart($user);
        
        $item = $panier->items()->find($itemId);

        if (!$item) {
            throw new \Exception('Cart item not found');
        }

        if ($newQuantity <= 0) {
            throw new \Exception('Quantity must be greater than 0');
        }

        $medicament = $item->medicament;

        if (!$medicament->isAvailable($newQuantity)) {
            throw new \Exception(
                "Insufficient stock. Available: {$medicament->stock}, Requested: {$newQuantity}"
            );
        }

        $item->updateQuantity($newQuantity);

        return [
            'id' => $item->id,
            'medicine_id' => $item->medicine_id,
            'quantity' => $item->quantity,
            'item_price' => $item->price,
            'subtotal' => $item->getSubtotal(),
            'cart_total' => $panier->calculateTotal(),
        ];
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(User $user, int $itemId): array
    {
        $panier = $this->getOrCreateCart($user);

        $item = $panier->items()->find($itemId);

        if (!$item) {
            throw new \Exception('Cart item not found');
        }

        $medicament = $item->medicament;
        $panier->removeItem($itemId);
        $panier->updateTotal();

        return [
            'removed_item_id' => $itemId,
            'removed_medicine' => $medicament->name,
            'cart_total' => $panier->calculateTotal(),
            'item_count' => $panier->getItemCount(),
        ];
    }

    /**
     * Clear entire cart.
     */
    public function clearCart(User $user): array
    {
        $panier = $this->getOrCreateCart($user);
        $itemCount = $panier->getItemCount();
        $panier->clear();

        return [
            'message' => 'Cart cleared successfully',
            'items_removed' => $itemCount,
            'cart_total' => 0,
        ];
    }

    /**
     * Calculate and get cart total.
     */
    public function calculateTotal(User $user): array
    {
        $panier = $this->getOrCreateCart($user);
        $total = $panier->calculateTotal();

        return [
            'total_price' => $total,
            'item_count' => $panier->getItemCount(),
            'items' => $panier->itemsWithMedicament->count(),
        ];
    }

    /**
     * Validate that all items in cart have sufficient stock.
     */
    public function validateCartStock(User $user): array
    {
        $panier = $this->getOrCreateCart($user);
        $issues = [];

        $panier->itemsWithMedicament->each(function ($item) use (&$issues) {
            if (!$item->medicament->isAvailable($item->quantity)) {
                $issues[] = [
                    'item_id' => $item->id,
                    'medicine_name' => $item->medicament->name,
                    'requested' => $item->quantity,
                    'available' => $item->medicament->stock,
                ];
            }
        });

        return [
            'is_valid' => empty($issues),
            'issues' => $issues,
        ];
    }
}
