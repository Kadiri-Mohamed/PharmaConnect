<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePharmacyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'pharmacien';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
        ];
    }
}
