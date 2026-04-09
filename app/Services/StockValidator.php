<?php

namespace App\Services;

use App\Models\Medicament;
use DomainException;
use Illuminate\Database\Eloquent\Collection;

class StockValidator
{
    /**
     * Validate a single medicament has required stock.
     *
     * @param Medicament $medicament
     * @param int $quantity
     * @return bool
     * @throws DomainException
     */
    public function validateAvailability(Medicament $medicament, int $quantity): bool
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        return $medicament->stock >= $quantity;
    }

    /**
     * Validate all items in collection have required stock.
     *
     * @param Collection $cartItems
     * @return void
     * @throws DomainException
     */
    public function validateCollectionAvailability(Collection $cartItems): void
    {
        foreach ($cartItems as $item) {
            if ($item->quantity <= 0) {
                throw new DomainException("Invalid quantity for {$item->medicament->name}");
            }

            if ($item->medicament->stock < $item->quantity) {
                throw new DomainException(
                    "Insufficient stock for {$item->medicament->name}. " .
                    "Available: {$item->medicament->stock}, " .
                    "Requested: {$item->quantity}"
                );
            }
        }
    }

    /**
     * Validate prescription requirements for cart items.
     *
     * @param Collection $cartItems
     * @param \App\Models\User $user
     * @return void
     * @throws DomainException
     */
    public function validatePrescriptionRequirements(Collection $cartItems, \App\Models\User $user): void
    {
        $prescriptionRequired = $cartItems->filter(
            fn($item) => $item->medicament->requires_prescription
        );

        if ($prescriptionRequired->isEmpty()) {
            return;
        }

        $submittedPrescriptions = $user->prescriptions()
            ->whereIn('status', ['pending', 'validated'])
            ->exists();

        if (! $submittedPrescriptions) {
            throw new DomainException(
                'Prescription upload required for selected items'
            );
        }
    }

    /**
     * Check if collection is all from same pharmacy.
     *
     * @param Collection $cartItems
     * @param int $expectedPharmacyId
     * @return void
     * @throws DomainException
     */
    public function validatePharmacyConsistency(Collection $cartItems, int $expectedPharmacyId): void
    {
        $invalidItems = $cartItems->filter(
            fn($item) => $item->medicament->pharmacy_id !== $expectedPharmacyId
        );

        if ($invalidItems->isNotEmpty()) {
            throw new DomainException(
                'Cart contains items from different pharmacies. ' .
                'All items must be from the same pharmacy.'
            );
        }
    }
}
