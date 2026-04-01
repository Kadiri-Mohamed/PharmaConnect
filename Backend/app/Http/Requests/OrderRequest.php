<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check();
    }

    public function rules(): array
    {
        return [
            'delivery_type' => 'nullable|string|in:pickup,delivery',
            'delivery_address' => 'nullable|string|max:500|required_if:delivery_type,delivery',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'delivery_type.in' => 'Delivery type must be either "pickup" or "delivery".',
            'delivery_address.required_if' => 'Delivery address is required when delivery type is "delivery".',
            'delivery_address.max' => 'Delivery address cannot exceed 500 characters.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
        ];
    }
}
