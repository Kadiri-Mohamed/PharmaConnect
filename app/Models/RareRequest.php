<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RareRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'medicine_name',
        'description',
        'status',
        'found_by_pharmacy_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function foundByPharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class, 'found_by_pharmacy_id');
    }
}