<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Medicament;
use DomainException;

class CartService
{
    public function addItem(Cart $cart, int $medicamentId, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        $medicament = Medicament::findOrFail($medicamentId);
        $existingFirstItem = $cart->items()->with('medicament')->first();

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

    public function removeItem(CartItem $cartItem): bool
    {
        return (bool) $cartItem->delete();
    }

    public function updateQuantity(CartItem $cartItem, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        $cartItem->update(['quantity' => $quantity]);
        return $cartItem->fresh();
    }

    public function clearCart(Cart $cart): void
    {
        $cart->items()->delete();
    }

    public function calculateTotal(Cart $cart): float
    {
        return $cart->items()->with('medicament')
            ->get()
            ->sum(function (CartItem $item) {
                return $item->medicament->price * $item->quantity;
            });
    }

    public function getItemCount(Cart $cart): int
    {
        return $cart->items()->sum('quantity');
    }

    public function isEmpty(Cart $cart): bool
    {
        return $cart->items()->count() === 0;
    }
}
