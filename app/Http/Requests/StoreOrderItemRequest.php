<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderItemRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1'
        ];
    }

    public function messages():array {
        return [
            'product_id.required' => 'Termék hiányzik',
            'product_id.exists'   => 'Termék nem létezik',
            'quantity.required'   => 'Mennyiség hiányzik',
            'quantity.integer'    => 'Mennyiség formátuma nem megfelelő',
            'quantity.min'        => 'Mennyiségnek legalább 1-nek kell lennie'
        ];
    }
}
