<?php

namespace App\Services\Pharmacy;

use App\Models\Pharmacy;
use App\Models\User;

class PharmacyService
{
    public function getForUser(User $user): ?Pharmacy
    {
        return $user->pharmacy;
    }

    public function createForUser(User $user, array $data): Pharmacy
    {
        if ($user->pharmacy) {
            throw new \RuntimeException('Pharmacy profile already exists for user.');
        }

        return Pharmacy::create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'opening_hours' => $data['opening_hours'],
            'is_on_duty' => $data['is_on_duty'],
        ]);
    }

    public function updateForUser(User $user, array $data): Pharmacy
    {
        $pharmacy = $user->pharmacy;

        if (!$pharmacy) {
            throw new \RuntimeException('Pharmacy profile not found.');
        }

        $pharmacy->update([
            'name' => $data['name'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'opening_hours' => $data['opening_hours'],
            'is_on_duty' => $data['is_on_duty'],
        ]);

        return $pharmacy;
    }
}
