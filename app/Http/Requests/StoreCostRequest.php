<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCostRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'month'  => 'required|date',
            'name'   => 'required|string',
            'amount' => 'required|numeric|min:1',
        ];
    }
}
