<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

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

    /**
     * Get the user that owns the pharmacy.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all medicaments in this pharmacy.
     */
    public function medicaments()
    {
        return $this->hasMany(Medicament::class);
    }

    /**
     * Get all commandes for this pharmacy.
     */
    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    /**
     * Scope: Get pharmacies that are on duty.
     */
    public function scopeOnDuty(Builder $query): Builder
    {
        return $query->where('is_on_duty', true);
    }

    /**
     * Scope: Get pharmacies that are off duty.
     */
    public function scopeOffDuty(Builder $query): Builder
    {
        return $query->where('is_on_duty', false);
    }

    /**
     * Scope: Search by name or address.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where('name', 'like', "%{$search}%")
                     ->orWhere('address', 'like', "%{$search}%")
                     ->orWhere('phone', 'like', "%{$search}%");
    }

    /**
     * Toggle on-duty status.
     */
    public function toggleOnDuty(): bool
    {
        return $this->update(['is_on_duty' => !$this->is_on_duty]);
    }

    /**
     * Check if pharmacy is on duty.
     */
    public function isOnDuty(): bool
    {
        return $this->is_on_duty;
    }

    /**
     * Get medicaments with low stock.
     */
    public function getLowStockMedicaments(int $threshold = 10)
    {
        return $this->medicaments()->lowStock($threshold)->get();
    }

    /**
     * Get total revenue from commandes.
     */
    public function getTotalRevenue(): float
    {
        return $this->commandes()->sum('total_price') ?? 0;
    }

    /**
     * Get total number of commandes.
     */
    public function getTotalCommandes(): int
    {
        return $this->commandes()->count();
    }

    /**
     * Get pending commandes count.
     */
    public function getPendingCommandesCount(): int
    {
        return $this->commandes()->where('status', Commande::STATUS_PENDING)->count();
    }
}

