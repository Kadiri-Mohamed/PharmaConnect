<?php

namespace App\Services;

use App\Models\Medicament;

class MedicamentService
{
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
}
