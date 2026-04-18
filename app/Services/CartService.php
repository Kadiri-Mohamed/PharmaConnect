<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Medicament;
use Exception;

class CartService
{
    public function addItem(Cart $cart, int $medicamentId, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            throw new Exception('Quantity must be greater than 0');
        }

        $medicament = Medicament::findOrFail($medicamentId);
        $firstItem = $cart->items()->with('medicament')->first();

        if ($firstItem && $firstItem->medicament->pharmacy_id !== $medicament->pharmacy_id) {
            throw new Exception('Your cart already contains items from another pharmacy.');
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
        return $cartItem->delete();
    }

    public function updateQuantity(CartItem $cartItem, int $quantity): CartItem
    {
        if ($quantity <= 0) {
            throw new Exception('Quantity must be greater than 0');
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
        $items = $cart->items()->with('medicament')->get();
        $total = 0;
        
        foreach ($items as $item) {
            $total = $total + ($item->medicament->price * $item->quantity);
        }
        
        return $total;
    }

    public function getItemCount(Cart $cart): int
    {
        return $cart->items()->sum('quantity');
    }
}