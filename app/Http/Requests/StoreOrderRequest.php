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
            'order_items'           => 'sometimes|array',
            'order_items.*.product_id' => 'required|exists:products,id',
            'order_items.*.quantity'   => 'required|integer|min:1',
            'order_schedule_id'     => 'required|exists:order_schedules,id'
        ];
    }
}
