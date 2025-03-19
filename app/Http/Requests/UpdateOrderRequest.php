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
            'customer_name' => 'sometimes|required|string',
            'phone'     => 'sometimes|string',
            'date'    => 'sometimes|required|date',
            'note'   => 'sometimes|string',
            'status' => 'sometimes|required|in:pending,processing,completed',
            'order_items'  => 'sometimes|required|array',
            'order_items.*.product_id' => 'sometimes|required|exists:products,id',
            'order_items.*.quantity'   => 'sometimes|required|integer|min:1',
            'order_schedule_id' => 'sometimes|required|exists:order_schedules,id'
        ];
    }
}
