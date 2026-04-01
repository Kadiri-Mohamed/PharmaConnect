<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class RareMedicineRequest extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_ANSWERED = 'answered';

    protected $fillable = [
        'user_id',
        'medicine_name',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Get the user that made the request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Get pending requests.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Get answered requests.
     */
    public function scopeAnswered(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ANSWERED);
    }

    /**
     * Scope: Filter by user.
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Filter by status.
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Search by medicine name.
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where('medicine_name', 'like', "%{$search}%")
                     ->orWhere('description', 'like', "%{$search}%");
    }

    /**
     * Mark request as answered.
     */
    public function markAsAnswered(): bool
    {
        return $this->update(['status' => self::STATUS_ANSWERED]);
    }

    /**
     * Check if request is pending.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if request is answered.
     */
    public function isAnswered(): bool
    {
        return $this->status === self::STATUS_ANSWERED;
    }
}
