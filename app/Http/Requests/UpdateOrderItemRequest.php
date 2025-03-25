<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderItemRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'quantity' => 'sometimes|required|integer|min:0'
        ];
    }

    public function messages():array {
        return [
            'quantity.required' => 'Mennyiség hiányzik',
            'quantity.integer'  => 'Mennyiség formátuma nem megfelelő',
            'quantity.min'      => 'Mennyiségnek pozitívnak kell lennie, törléshez 0-t adj meg',
        ];
    }
}
