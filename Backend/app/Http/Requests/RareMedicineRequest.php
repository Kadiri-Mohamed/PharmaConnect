<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RareMedicineRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Allow both authenticated users and visitors
        return true;
    }

    public function rules(): array
    {
        return [
            'medicine_name' => 'required|string|max:255|min:2',
            'description' => 'required|string|max:1000|min:10',
        ];
    }

    public function messages(): array
    {
        return [
            'medicine_name.required' => 'The medicine name is required.',
            'medicine_name.string' => 'The medicine name must be a string.',
            'medicine_name.max' => 'The medicine name cannot exceed 255 characters.',
            'medicine_name.min' => 'The medicine name must be at least 2 characters.',
            'description.required' => 'The description is required.',
            'description.string' => 'The description must be a string.',
            'description.max' => 'The description cannot exceed 1000 characters.',
            'description.min' => 'The description must be at least 10 characters.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Set user_id if authenticated, null for visitors
        $user = auth('api')->user();
        if ($user) {
            $this->merge(['user_id' => $user->id]);
        }
    }
}
