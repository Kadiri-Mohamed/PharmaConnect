<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PanierItem extends Model
{
    use HasFactory;

    protected $table = 'cart_items';

    public $timestamps = false;

    protected $fillable = [
        'cart_id',
        'medicine_id',
        'quantity',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    /**
     * Get the panier that owns this item.
     */
    public function panier()
    {
        return $this->belongsTo(Panier::class, 'cart_id');
    }

    /**
     * Get the medicament for this panier item.
     */
    public function medicament()
    {
        return $this->belongsTo(Medicament::class, 'medicine_id');
    }

    /**
     * Get the subtotal for this item.
     */
    public function getSubtotal(): float
    {
        return (float) ($this->quantity * $this->price);
    }

    /**
     * Update item quantity.
     */
    public function updateQuantity(int $quantity): void
    {
        $this->update(['quantity' => $quantity]);
        $this->panier->updateTotal();
    }
}
