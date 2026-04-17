<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user() && $this->user()->role === 'client';
    }

    public function rules(): array
    {
        return [
            'pharmacy_id' => ['required', 'exists:pharmacies,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'pharmacy_id.required' => 'The pharmacy is required to place an order.',
            'pharmacy_id.exists' => 'The selected pharmacy does not exist.',
        ];
    }
}
