<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MedicineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check() && auth('api')->user()->role === 'pharmacist';
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255|unique:medicines,name,NULL,id,pharmacy_id,' . (auth('api')->user()->pharmacy?->id ?? 'NULL'),
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0|max:999999.99',
            'stock' => 'required|integer|min:0',
            'requires_prescription' => 'required|boolean',
        ];

        // For update requests, make name unique except for the current medicine
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $medicineId = $this->route('medicine') ?? $this->route('medicines');
            $rules['name'] = 'required|string|max:255|unique:medicines,name,' . $medicineId . ',id,pharmacy_id,' . (auth('api')->user()->pharmacy?->id ?? 'NULL');
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The medicine name is required.',
            'name.unique' => 'A medicine with this name already exists in your pharmacy.',
            'price.required' => 'The price is required.',
            'price.numeric' => 'The price must be a valid number.',
            'price.min' => 'The price must be at least 0.',
            'stock.required' => 'The stock quantity is required.',
            'stock.integer' => 'The stock must be a whole number.',
            'stock.min' => 'The stock cannot be negative.',
            'requires_prescription.required' => 'You must specify whether this medicine requires a prescription.',
            'requires_prescription.boolean' => 'The prescription requirement must be true or false.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Ensure pharmacy_id is set to the authenticated user's pharmacy
        $user = auth('api')->user();
        
        if ($user && $user->pharmacy) {
            $this->merge([
                'pharmacy_id' => $user->pharmacy->id,
            ]);
        }
    }
}
