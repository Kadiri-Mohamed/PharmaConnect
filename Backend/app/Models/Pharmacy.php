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
        'opening_hours',
        'is_on_duty',
    ];

    protected $casts = [
        'is_on_duty' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
