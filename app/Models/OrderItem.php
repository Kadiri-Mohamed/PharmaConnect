<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'medicament_id',
        'quantity',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price' => 'float',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function medicament()
    {
        return $this->belongsTo(Medicament::class);
    }
}