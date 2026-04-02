<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pharmacy extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'address',
        'phone',
        'status_garde',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status_garde' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the pharmacy.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the medicaments for the pharmacy.
     */
    public function medicaments()
    {
        return $this->hasMany(Medicament::class);
    }

    /**
     * Get the orders for the pharmacy.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
