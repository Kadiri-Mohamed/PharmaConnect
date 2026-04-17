<?php

namespace App\Services;

use App\Models\Medicament;
use DomainException;
use Illuminate\Support\Facades\DB;

class InventoryManager
{
    public function decreaseStockSafely(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        return DB::transaction(function () use ($medicament, $quantity) {
            $lockedMedicament = Medicament::lockForUpdate()
                ->find($medicament->id);

            if (! $lockedMedicament) {
                throw new DomainException('Medicament not found');
            }

            if ($lockedMedicament->stock < $quantity) {
                throw new DomainException(
                    "Insufficient stock for {$lockedMedicament->name}. " .
                    "Available: {$lockedMedicament->stock}, Requested: {$quantity}"
                );
            }

            $lockedMedicament->decrement('stock', $quantity);
            return $lockedMedicament->refresh();
        });
    }

    public function increaseStockSafely(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        return DB::transaction(function () use ($medicament, $quantity) {
            $lockedMedicament = Medicament::lockForUpdate()
                ->find($medicament->id);

            if (! $lockedMedicament) {
                throw new DomainException('Medicament not found');
            }

            $lockedMedicament->increment('stock', $quantity);
            return $lockedMedicament->refresh();
        });
    }

    public function setStockSafely(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity < 0) {
            throw new DomainException('Stock cannot be negative');
        }

        return DB::transaction(function () use ($medicament, $quantity) {
            $lockedMedicament = Medicament::lockForUpdate()
                ->find($medicament->id);

            if (! $lockedMedicament) {
                throw new DomainException('Medicament not found');
            }

            $lockedMedicament->update(['stock' => $quantity]);
            return $lockedMedicament->refresh();
        });
    }

    public function hasAvailableStock(Medicament $medicament, int $quantity): bool
    {
        return $medicament->stock >= $quantity;
    }

    public function getAvailabilityStatus(Medicament $medicament): array
    {
        return [
            'medicament_id' => $medicament->id,
            'name' => $medicament->name,
            'current_stock' => $medicament->stock,
            'is_available' => $medicament->stock > 0,
            'requires_prescription' => $medicament->requires_prescription,
            'low_stock' => $medicament->stock < 5,
        ];
    }
}
