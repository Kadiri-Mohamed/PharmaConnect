<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PharmacyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check() && auth('api')->user()->role === 'pharmacist';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'phone' => 'required|string|max:40',
            'opening_hours' => 'required|string',
            'is_on_duty' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'is_on_duty.boolean' => 'The on-duty field must be true or false.',
        ];
    }
}
