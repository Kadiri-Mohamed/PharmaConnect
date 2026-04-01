<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Commande extends Model
{
    use HasFactory;

    protected $table = 'orders';

    const STATUS_PENDING = 'pending';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY = 'ready';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'pharmacy_id',
        'status',
        'total_price',
        'delivery_type',
        'delivery_address',
        'notes',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'status' => 'string',
    ];

    /**
     * Get the user that placed the commande.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the pharmacy for this commande.
     */
    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    /**
     * Get the items for this commande.
     */
    public function items()
    {
        return $this->hasMany(CommandeItem::class, 'order_id');
    }

    /**
     * Get commande items with medicament details.
     */
    public function itemsWithMedicament()
    {
        return $this->hasMany(CommandeItem::class, 'order_id')->with('medicament');
    }

    /**
     * Scope: Get pending commandes.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Get preparing commandes.
     */
    public function scopePreparing(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PREPARING);
    }

    /**
     * Scope: Get ready commandes.
     */
    public function scopeReady(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_READY);
    }

    /**
     * Scope: Get delivered commandes.
     */
    public function scopeDelivered(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_DELIVERED);
    }

    /**
     * Scope: Get by user.
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Get by pharmacy.
     */
    public function scopeByPharmacy(Builder $query, int $pharmacyId): Builder
    {
        return $query->where('pharmacy_id', $pharmacyId);
    }

    /**
     * Scope: Filter by status.
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Update commande status.
     */
    public function updateStatus(string $status): bool
    {
        if (!in_array($status, [self::STATUS_PENDING, self::STATUS_PREPARING, self::STATUS_READY, self::STATUS_DELIVERED, self::STATUS_CANCELLED])) {
            return false;
        }

        if ($status === self::STATUS_CANCELLED) {
            $this->handleCancellation();
        }

        return $this->update(['status' => $status]);
    }

    /**
     * Handle commande cancellation (restore stock).
     */
    protected function handleCancellation(): void
    {
        $this->items()->get()->each(function (CommandeItem $item) {
            $item->medicament->increaseStock($item->quantity);
        });
    }

    /**
     * Check if commande can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_PREPARING]);
    }

    /**
     * Calculate total price from commande items.
     */
    public function calculateTotal(): float
    {
        return $this->items()->sum(
            \DB::raw('quantity * price')
        ) ?? 0;
    }

    /**
     * Get formatted status badge.
     */
    public function getStatusBadge(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'warning',
            self::STATUS_PREPARING => 'info',
            self::STATUS_READY => 'success',
            self::STATUS_DELIVERED => 'success',
            self::STATUS_CANCELLED => 'danger',
            default => 'secondary',
        };
    }
}
