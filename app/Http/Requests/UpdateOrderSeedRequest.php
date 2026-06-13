<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderSeedRequest extends FormRequest
{
    public function rules(): array
    {
        $seedId = $this->route('id') ?? $this->route('seed') ?? $this->segment(2) ?? $this->segment(3);

        return [
            'day' => [
                'sometimes',
                'required',
                'integer',
                'in:1,2,3,4,5,6,7',
                Rule::unique('order_seeds', 'day')->ignore($seedId)
            ],
            'orders' => 'sometimes|array|min:1',
            'orders.*.customer_name' => 'sometimes|string|min:1',
            'orders.*.is_paying' => 'sometimes|boolean',
            'orders.*.order_items' => 'sometimes|array|min:1',
            'orders.*.order_items.*.product_id' => 'sometimes|integer|exists:products,id',
            'orders.*.order_items.*.product_name' => 'sometimes|string',
            'orders.*.order_items.*.quantity' => 'sometimes|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'day.required' => 'A nap kiválasztása kötelező!',
            'day.unique' => 'Ez a nap már szerepel a rendszerben, módosítsd!',
            'orders.required' => 'Legalább egy rendelést fel kell venned!',
            'orders.*.customer_name.required' => 'A vásárló neve nem maradhat üresen!',
            'orders.*.is_paying.required' => 'A fizetési státusz megadása kötelező!',
            'orders.*.order_items.required' => 'A rendeléshez kötelező terméket adni!',
            'orders.*.order_items.*.quantity.min' => 'A mennyiség legalább 1 db kell legyen!',
        ];
    }
}
