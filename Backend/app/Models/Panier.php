<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Panier extends Model
{
    use HasFactory;

    protected $table = 'carts';

    protected $fillable = [
        'user_id',
        'total_price',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the user that owns the panier.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items in the panier.
     */
    public function items()
    {
        return $this->hasMany(PanierItem::class, 'cart_id');
    }

    /**
     * Get panier items with medicament details.
     */
    public function itemsWithMedicament()
    {
        return $this->hasMany(PanierItem::class, 'cart_id')->with('medicament');
    }

    /**
     * Add item to panier or update quantity if exists.
     */
    public function addOrUpdateItem(int $medicamentId, int $quantity, float $price): PanierItem
    {
        $item = $this->items()->where('medicine_id', $medicamentId)->first();

        if ($item) {
            $item->update([
                'quantity' => $item->quantity + $quantity,
            ]);
            return $item;
        }

        return $this->items()->create([
            'medicine_id' => $medicamentId,
            'quantity' => $quantity,
            'price' => $price,
        ]);
    }

    /**
     * Remove item from panier.
     */
    public function removeItem(int $itemId): bool
    {
        return $this->items()->where('id', $itemId)->delete() > 0;
    }

    /**
     * Clear all items from panier.
     */
    public function clear(): bool
    {
        $this->items()->delete();
        $this->update(['total_price' => 0]);
        return true;
    }

    /**
     * Calculate total price of panier.
     */
    public function calculateTotal(): float
    {
        return $this->items()->sum(
            \DB::raw('quantity * price')
        ) ?? 0;
    }

    /**
     * Update total price.
     */
    public function updateTotal(): void
    {
        $this->update(['total_price' => $this->calculateTotal()]);
    }

    /**
     * Get count of items in panier.
     */
    public function getItemCount(): int
    {
        return $this->items()->sum('quantity');
    }

    /**
     * Check if panier is empty.
     */
    public function isEmpty(): bool
    {
        return $this->items()->count() === 0;
    }
}
