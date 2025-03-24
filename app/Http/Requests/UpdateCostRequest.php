<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCostRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'month'  => 'sometimes|required|date',
            'name'   => 'sometimes|required|string',
            'amount' => 'sometimes|required|numeric|min:1',
        ];
    }
}
