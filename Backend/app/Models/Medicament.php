<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Medicament extends Model
{
    use HasFactory;

    protected $table = 'medicines';

    protected $fillable = [
        'pharmacy_id',
        'name',
        'description',
        'price',
        'stock',
        'requires_prescription',
    ];

    protected $casts = [
        'requires_prescription' => 'boolean',
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    /**
     * Get the pharmacy that owns the medicament.
     */
    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    /**
     * Get the panier items for this medicament.
     */
    public function panierItems()
    {
        return $this->hasMany(PanierItem::class, 'medicine_id');
    }

    /**
     * Get the commande items for this medicament.
     */
    public function commandeItems()
    {
        return $this->hasMany(CommandeItem::class, 'medicine_id');
    }

    /**
     * Scope: Get medicaments with low stock.
     */
    public function scopeLowStock(Builder $query, int $threshold = 10): Builder
    {
        return $query->where('stock', '<=', $threshold);
    }

    /**
     * Scope: Get medicaments that are in stock.
     */
    public function scopeInStock(Builder $query): Builder
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Scope: Get medicaments that require prescription.
     */
    public function scopeRequiresPrescription(Builder $query): Builder
    {
        return $query->where('requires_prescription', true);
    }

    /**
     * Scope: Filter by pharmacy.
     */
    public function scopeByPharmacy(Builder $query, int $pharmacyId): Builder
    {
        return $query->where('pharmacy_id', $pharmacyId);
    }

    /**
     * Scope: Search by name or description.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where('name', 'like', "%{$search}%")
                     ->orWhere('description', 'like', "%{$search}%");
    }

    /**
     * Scope: Filter by price range.
     */
    public function scopePriceRange(Builder $query, float $min, float $max): Builder
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    /**
     * Check if medicament is available in stock.
     */
    public function isAvailable(int $quantity = 1): bool
    {
        return $this->stock >= $quantity;
    }

    /**
     * Reduce stock after commande.
     */
    public function reduceStock(int $quantity = 1): bool
    {
        if ($this->isAvailable($quantity)) {
            $this->decrement('stock', $quantity);
            return true;
        }
        return false;
    }

    /**
     * Increase stock (e.g., on commande cancellation).
     */
    public function increaseStock(int $quantity = 1): void
    {
        $this->increment('stock', $quantity);
    }
}
