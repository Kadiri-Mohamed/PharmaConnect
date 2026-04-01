<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check();
    }

    public function rules(): array
    {
        return [
            'medicine_id' => 'required_if:action,add|integer|exists:medicines,id',
            'quantity' => 'required_if:action,add|integer|min:1|max:10000',
            'item_id' => 'required_if:action,update,remove|integer|exists:cart_items,id',
            'new_quantity' => 'required_if:action,update|integer|min:1|max:10000',
        ];
    }

    public function messages(): array
    {
        return [
            'medicine_id.required_if' => 'The medicine ID is required when adding an item.',
            'medicine_id.exists' => 'The selected medicine does not exist.',
            'quantity.required_if' => 'The quantity is required when adding an item.',
            'quantity.integer' => 'The quantity must be a whole number.',
            'quantity.min' => 'The quantity must be at least 1.',
            'quantity.max' => 'The quantity cannot exceed 10000.',
            'item_id.required_if' => 'The item ID is required for this action.',
            'item_id.exists' => 'The cart item does not exist.',
            'new_quantity.required_if' => 'The new quantity is required when updating.',
            'new_quantity.integer' => 'The new quantity must be a whole number.',
            'new_quantity.min' => 'The new quantity must be at least 1.',
            'new_quantity.max' => 'The new quantity cannot exceed 10000.',
        ];
    }
}
