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
            'available_date' => [
                'sometimes',
                'required',
                'date',
                Rule::unique('order_schedules', 'available_date')->ignore($this->route('orderSchedule')?->id ?? $this->route('orderSchedule')),
            ],
            'note' => 'sometimes|nullable|string',
            'products' => 'sometimes|required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.max_quantity' => 'required|integer|min:1',
        ];
    }



    public function messages(): array
    {
        return [
            'available_date.required' => 'Dátum hiányzik',
            'available_date.unique'   => 'Dátum már foglalt',
            'available_date.date'     => 'Dátum formátuma nem megfelelő',
            'note.string'            => 'Megjegyzés formátuma nem megfelelő',
            'products.required'       => 'Termékek hiányzik',
            'products.array'          => 'Termékek formátuma nem megfelelő',
            'products.*.id.required'  => 'Termék hiányzik',
            'products.*.id.exists'    => 'Termék nem létezik',
            'products.*.max_quantity.required' => 'Mennyiség hiányzik',
            'products.*.max_quantity.integer'  => 'Mennyiség formátuma nem megfelelő',
            'products.*.max_quantity.min'      => 'Mennyiségnek legalább 1-nek kell lennie',
        ];
    }
}
