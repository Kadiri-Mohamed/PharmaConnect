<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Medicament;
use DomainException;
use Illuminate\Database\Eloquent\Collection;

class CartService
{
    /**
     * Add an item to the cart.
     *
     * @param Cart $cart
     * @param int $medicamentId
     * @param int $quantity
     * @return CartItem
     * @throws DomainException
     */
    public function addItem(Cart $cart, int $medicamentId, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        $medicament = Medicament::findOrFail($medicamentId);
        $existingFirstItem = $cart->items()->with('medicament')->first();

        // Force one-pharmacy-per-cart to avoid order creation failures at checkout.
        if ($existingFirstItem && $existingFirstItem->medicament->pharmacy_id !== $medicament->pharmacy_id) {
            throw new DomainException('Your cart already contains items from another pharmacy.');
        }

        $existingItem = $cart->items()->where('medicament_id', $medicamentId)->first();

        if ($existingItem) {
            $existingItem->increment('quantity', $quantity);
            return $existingItem->fresh();
        }

        return $cart->items()->create([
            'medicament_id' => $medicamentId,
            'quantity' => $quantity,
        ]);
    }

    /**
     * Remove an item from the cart.
     *
     * @param CartItem $cartItem
     * @return bool
     */
    public function removeItem(CartItem $cartItem): bool
    {
        return (bool) $cartItem->delete();
    }

    /**
     * Update the quantity of a cart item.
     *
     * @param CartItem $cartItem
     * @param int $quantity
     * @return CartItem
     * @throws DomainException
     */
    public function updateQuantity(CartItem $cartItem, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        $cartItem->update(['quantity' => $quantity]);
        return $cartItem->fresh();
    }

    /**
     * Clear all items from the cart.
     *
     * @param Cart $cart
     * @return void
     */
    public function clearCart(Cart $cart): void
    {
        $cart->items()->delete();
    }

    /**
     * Calculate the total price of the cart.
     *
     * @param Cart $cart
     * @return float
     */
    public function calculateTotal(Cart $cart): float
    {
        return $cart->items()->with('medicament')
            ->get()
            ->sum(function (CartItem $item) {
                return $item->medicament->price * $item->quantity;
            });
    }

    /**
     * Get the item count in the cart.
     *
     * @param Cart $cart
     * @return int
     */
    public function getItemCount(Cart $cart): int
    {
        return $cart->items()->sum('quantity');
    }

    /**
     * Check if cart is empty.
     *
     * @param Cart $cart
     * @return bool
     */
    public function isEmpty(Cart $cart): bool
    {
        return $cart->items()->count() === 0;
    }
}
