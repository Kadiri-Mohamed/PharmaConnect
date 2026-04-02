<?php

namespace App\Services;

use App\Models\Medicament;
use DomainException;
use Illuminate\Database\Eloquent\Collection;

class MedicamentService
{
    /**
     * Decrease the stock of a medicament.
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return Medicament
     * @throws DomainException
     */
    public function decreaseStock(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        if (!$this->isAvailable($medicament, $quantity)) {
            throw new DomainException(
                "Insufficient stock for {$medicament->name}. Available: {$medicament->stock}, Requested: {$quantity}"
            );
        }

        $medicament->decrement('stock', $quantity);
        return $medicament->fresh();
    }

    /**
     * Increase the stock of a medicament.
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return Medicament
     * @throws DomainException
     */
    public function increaseStock(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        $medicament->increment('stock', $quantity);
        return $medicament->fresh();
    }

    /**
     * Update medicament stock to a specific value.
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return Medicament
     * @throws DomainException
     */
    public function updateStock(Medicament $medicament, int $quantity): Medicament
    {
        if ($quantity < 0) {
            throw new DomainException('Stock cannot be negative');
        }

        $medicament->update(['stock' => $quantity]);
        return $medicament->fresh();
    }

    /**
     * Check if a medicament is available in the required quantity.
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return bool
     */
    public function isAvailable(Medicament $medicament, int $quantity): bool
    {
        return $medicament->stock >= $quantity;
    }

    /**
     * Get the availability status of a medicament.
     *
     * @param Medicament $medicament
     * @return array
     */
    public function getAvailabilityStatus(Medicament $medicament): array
    {
        return [
            'medicament_id' => $medicament->id,
            'name' => $medicament->name,
            'stock' => $medicament->stock,
            'is_available' => $medicament->stock > 0,
            'requires_prescription' => $medicament->requires_prescription,
        ];
    }

    /**
     * Get medicaments by pharmacy.
     *
     * @param int $pharmacyId
     * @return Collection
     */
    public function getMedicamentsByPharmacy(int $pharmacyId): Collection
    {
        return Medicament::where('pharmacy_id', $pharmacyId)->get();
    }

    /**
     * Get available medicaments by pharmacy.
     *
     * @param int $pharmacyId
     * @return Collection
     */
    public function getAvailableMedicamentsByPharmacy(int $pharmacyId): Collection
    {
        return Medicament::where('pharmacy_id', $pharmacyId)
            ->where('stock', '>', 0)
            ->get();
    }

    /**
     * Search medicaments by name.
     *
     * @param string $name
     * @return Collection
     */
    public function searchByName(string $name): Collection
    {
        return Medicament::where('name', 'like', "%{$name}%")->get();
    }

    /**
     * Get medicaments that require prescription.
     *
     * @return Collection
     */
    public function getPrescriptionRequired(): Collection
    {
        return Medicament::where('requires_prescription', true)->get();
    }
}
