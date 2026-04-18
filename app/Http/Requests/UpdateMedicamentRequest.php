<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicamentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'pharmacien';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'stock' => ['required', 'integer', 'min:0'],
            'requires_prescription' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'price.numeric' => 'The price must be a valid number.',
            'stock.integer' => 'The stock must be an integer.',
        ];
    }
}
