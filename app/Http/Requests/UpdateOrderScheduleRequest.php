<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderScheduleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'available_date' => 'sometimes|required|date',
            'products' => 'sometimes|required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.max_quantity' => 'required|integer|min:1',
        ];
    }
}
