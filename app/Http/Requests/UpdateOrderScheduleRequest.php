<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderScheduleRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'available_date' => 'required|date|unique:order_schedules,available_date,' . $this->route('orderSchedule')->id,
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.max_quantity' => 'required|integer|min:1',
        ];
    }
}
