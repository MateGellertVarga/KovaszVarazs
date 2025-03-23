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
}
