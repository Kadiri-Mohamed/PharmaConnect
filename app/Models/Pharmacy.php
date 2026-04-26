<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pharmacy extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'address',
        'phone',
        'status_garde',
    ];

    protected function casts(): array
    {
        return [
            'status_garde' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function medicaments()
    {
        return $this->hasMany(Medicament::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}