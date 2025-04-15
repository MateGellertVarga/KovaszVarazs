<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'user_id'               => 'sometimes|nullable|exists:users,id',
            'customer_name'         => 'nullable|string',
            'phone_number'                 => 'nullable|string',
            'note'                  => 'nullable|string',
            'status'                => 'required|in:pending,processing,completed',
            'already_paid'         => 'required|boolean',
            'is_paying'             => 'required|boolean',
            'order_items'           => 'sometimes|array',
            'order_items.*.product_id' => 'required|exists:products,id',
            'order_items.*.quantity'   => 'required|integer|min:1',
            'order_schedule_id'     => 'required|exists:order_schedules,id'
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'                => 'Felhasználó hiányzik',
            'user_id.exists'                  => 'Felhasználó nem létezik',
            'customer_name.string'            => 'Név formátuma nem megfelelő',
            'phone_number.string'             => 'Telefonszám formátuma nem megfelelő',
            'note.string'                     => 'Megjegyzés formátuma nem megfelelő',
            'status.required'                 => 'Állapot hiányzik',
            'status.in'                       => 'Állapot nem megfelelő',
            'already_paid.required'           => 'Már fizetett-e hiányzik',
            'already_paid.boolean'            => 'Már fizetett-e formátuma nem megfelelő',
            'is_paying.required'              => 'Fizet-e hiányzik',
            'is_paying.boolean'               => 'Fizet-e formátuma nem megfelelő',
            'order_items.array'               => 'Rendelési tételek formátuma nem megfelelő',
            'order_items.*.product_id.required' => 'Termék hiányzik',
            'order_items.*.product_id.exists'   => 'Termék nem létezik',
            'order_items.*.quantity.required'   => 'Mennyiség hiányzik',
            'order_items.*.quantity.integer'    => 'Mennyiség formátuma nem megfelelő',
            'order_items.*.quantity.min'        => 'Mennyiségnek legalább 1-nek kell lennie',
            'order_schedule_id.required'       => 'Sütés időpont hiányzik',
            'order_schedule_id.exists'         => 'Sütés időpont nem létezik',
        ];
    }
}
