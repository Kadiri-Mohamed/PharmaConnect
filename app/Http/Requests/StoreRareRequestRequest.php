<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRareRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'medicine_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
