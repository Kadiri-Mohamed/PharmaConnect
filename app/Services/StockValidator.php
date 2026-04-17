<?php

namespace App\Services;

use App\Models\Medicament;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Collection;

class StockValidator
{
    public function validateAvailability(Medicament $medicament, int $quantity): bool
    {
        if ($quantity <= 0) {
            throw new DomainException('Quantity must be greater than 0');
        }

        return $medicament->stock >= $quantity;
    }

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

    public function validatePrescriptionRequirements(Collection $cartItems, User $user): void
    {
        $prescriptionRequired = $cartItems->filter(
            fn ($item) => $item->medicament->requires_prescription
        );

        if ($prescriptionRequired->isEmpty()) {
            return;
        }

        $submittedPrescriptions = $user->prescriptions()
            ->whereIn('status', ['pending', 'validated'])
            ->doesntHave('orders')
            ->exists();

        if (! $submittedPrescriptions) {
            throw new DomainException(
                'Prescription upload required for selected items'
            );
        }
    }

    public function validatePharmacyConsistency(Collection $cartItems, int $expectedPharmacyId): void
    {
        $invalidItems = $cartItems->filter(
            fn ($item) => $item->medicament->pharmacy_id !== $expectedPharmacyId
        );

        if ($invalidItems->isNotEmpty()) {
            throw new DomainException(
                'Cart contains items from different pharmacies. ' .
                'All items must be from the same pharmacy.'
            );
        }
    }
}
