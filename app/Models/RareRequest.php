<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class RareRequest extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'medicine_name',
        'description',
        'status',
        'found_by_pharmacy_id',
    ];

    /**
     * Get the pharmacy that found the requested medicine.
     */
    public function foundByPharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class, 'found_by_pharmacy_id');
    }
}
