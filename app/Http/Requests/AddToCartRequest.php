<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'client';
    }

    public function rules(): array
    {
        return [
            'medicament_id' => ['required', 'exists:medicaments,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:9999'],
        ];
    }

    public function messages(): array
    {
        return [
            'medicament_id.required' => 'The medicament is required.',
            'medicament_id.exists' => 'The selected medicament does not exist.',
            'quantity.required' => 'The quantity is required.',
            'quantity.integer' => 'The quantity must be a whole number.',
            'quantity.min' => 'The quantity must be at least 1.',
        ];
    }
}
