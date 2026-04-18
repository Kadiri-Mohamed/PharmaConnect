<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRareRequestStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'pharmacien';
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:pending,found,not_found'],
        ];
    }
}
