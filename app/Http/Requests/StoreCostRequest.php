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

    public function messages():array {
        return [
            'month.required'  => 'Hónap hiányzik',
            'month.date'      => 'Hónap formátuma nem megfelelő',
            'name.required'   => 'Név hiányzik',
            'name.string'     => 'Név formátuma nem megfelelő',
            'amount.required' => 'Összeg hiányzik',
            'amount.numeric'  => 'Összeg formátuma nem megfelelő',
            'amount.min'      => 'Összegnek legalább 1-nek kell lennie'
        ];
    }
}
