<?php

namespace App\Services;

use App\Models\Medicament;
use DomainException;
use Illuminate\Support\Facades\DB;

class InventoryManager
{
    /**
     * Decrease stock with pessimistic locking to prevent race conditions.
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return Medicament
     * @throws DomainException
     */
    public function decreaseStockSafely(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        return DB::transaction(function () use ($medicament, $quantity) {
            // Lock the row for update to prevent concurrent modifications
            $lockedMedicament = Medicament::lockForUpdate()
                ->find($medicament->id);

            if (!$lockedMedicament) {
                throw new DomainException('Medicament not found');
            }

            if ($lockedMedicament->stock < $quantity) {
                throw new DomainException(
                    "Insufficient stock for {$lockedMedicament->name}. " .
                    "Available: {$lockedMedicament->stock}, Requested: {$quantity}"
                );
            }

            $lockedMedicament->decrement('stock', $quantity);

            // Return refreshed instance instead of using fresh()
            return $lockedMedicament->refresh();
        });
    }

    /**
     * Increase stock safely.
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return Medicament
     * @throws DomainException
     */
    public function increaseStockSafely(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        return DB::transaction(function () use ($medicament, $quantity) {
            $lockedMedicament = Medicament::lockForUpdate()
                ->find($medicament->id);

            if (!$lockedMedicament) {
                throw new DomainException('Medicament not found');
            }

            $lockedMedicament->increment('stock', $quantity);
            return $lockedMedicament->refresh();
        });
    }

    /**
     * Set stock to exact value with validation.
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return Medicament
     * @throws DomainException
     */
    public function setStockSafely(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity < 0) {
            throw new DomainException('Stock cannot be negative');
        }

        return DB::transaction(function () use ($medicament, $quantity) {
            $lockedMedicament = Medicament::lockForUpdate()
                ->find($medicament->id);

            if (!$lockedMedicament) {
                throw new DomainException('Medicament not found');
            }

            $lockedMedicament->update(['stock' => $quantity]);
            return $lockedMedicament->refresh();
        });
    }

    /**
     * Check if medicament has sufficient stock (without locking).
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return bool
     */
    public function hasAvailableStock(Medicament $medicament, int $quantity): bool
    {
        return $medicament->stock >= $quantity;
    }

    /**
     * Get detailed availability status.
     *
     * @param Medicament $medicament
     * @return array
     */
    public function getAvailabilityStatus(Medicament $medicament): array
    {
        return [
            'medicament_id' => $medicament->id,
            'name' => $medicament->name,
            'current_stock' => $medicament->stock,
            'is_available' => $medicament->stock > 0,
            'requires_prescription' => $medicament->requires_prescription,
            'low_stock' => $medicament->stock < 5,  // Alert if low
        ];
    }
}
