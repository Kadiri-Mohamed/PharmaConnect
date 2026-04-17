<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        $statuses = $this->user()?->role === 'pharmacien'
            ? 'pending,preparing,ready,delivered,cancelled'
            : 'cancelled';

        return [
            'status' => ['required', 'string', "in:{$statuses}"],
        ];
    }
}
