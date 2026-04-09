<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'image',
        'status',
    ];

    /**
     * Get the user that owns the prescription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the orders linked to this prescription.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
