<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'customer_name'       => 'sometimes|nullable|string',
            'phone_number'        => 'sometimes|nullable|string',
            'note'                => 'sometimes|nullable|string',
            'status'              => 'sometimes|required|in:pending,processing,completed',
            'is_paying'           => 'sometimes|nullable|boolean',
            'order_schedule_id'   => 'sometimes|required|exists:order_schedules,id',
            'order_items'         => 'sometimes|array',
            'order_items.*.product_id' => 'required_with:order_items|exists:products,id',
            'order_items.*.quantity'   => 'required_with:order_items|integer|min:0',
        ];
    }

    public function messages():array {
        return [
            'customer_name.string' => 'Név formátuma nem megfelelő',
            'phone_number.string'  => 'Telefonszám formátuma nem megfelelő',
            'note.string'          => 'Megjegyzés formátuma nem megfelelő',
            'status.required'      => 'Állapot hiányzik',
            'status.in'            => 'Állapot nem megfelelő',
            'is_paying.boolean'    => 'Fizetés formátuma nem megfelelő',
            'order_schedule_id.required' => 'Időpont hiányzik',
            'order_schedule_id.exists'   => 'Időpont nem létezik',
            'order_items.array'          => 'Rendelés formátuma nem megfelelő',
            'order_items.*.product_id.required_with' => 'Termék hiányzik',
            'order_items.*.product_id.exists'        => 'Termék nem létezik',
            'order_items.*.quantity.required_with'   => 'Mennyiség hiányzik',
            'order_items.*.quantity.integer'         => 'Mennyiség formátuma nem megfelelő',
            'order_items.*.quantity.min'             => 'Mennyiségnek pozitívnak kell lennie, törléshez 0-t adj meg',
        ];
    }
}
