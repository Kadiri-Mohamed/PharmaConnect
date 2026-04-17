<?php

namespace App\Services;

use App\Models\Medicament;
use DomainException;
use Illuminate\Support\Facades\DB;

class InventoryManager
{
    public function decreaseStock(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        return DB::transaction(function () use ($medicament, $quantity) {
            $lockedMedicament = Medicament::lockForUpdate()->find($medicament->id);

            if (!$lockedMedicament) {
                throw new DomainException('Medicament not found');
            }

            if ($lockedMedicament->stock < $quantity) {
                throw new DomainException("Insufficient stock for {$lockedMedicament->name}");
            }

            $lockedMedicament->decrement('stock', $quantity);
            return $lockedMedicament->refresh();
        });
    }

    public function increaseStock(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        return DB::transaction(function () use ($medicament, $quantity) {
            $lockedMedicament = Medicament::lockForUpdate()->find($medicament->id);
            $lockedMedicament->increment('stock', $quantity);
            return $lockedMedicament->refresh();
        });
    }

    public function checkAvailability(Medicament $medicament, int $quantity): bool
    {
        return $medicament->stock >= $quantity;
    }
}