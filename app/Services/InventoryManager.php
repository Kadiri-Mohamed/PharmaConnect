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
}
