<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommandeItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';

    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'medicine_id',
        'quantity',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    /**
     * Get the commande that owns this item.
     */
    public function commande()
    {
        return $this->belongsTo(Commande::class, 'order_id');
    }

    /**
     * Get the medicament for this commande item.
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
}
