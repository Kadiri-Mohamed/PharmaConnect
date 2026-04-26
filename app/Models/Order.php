<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pharmacy_id',
        'prescription_id',
        'status',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'total_price' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }
}