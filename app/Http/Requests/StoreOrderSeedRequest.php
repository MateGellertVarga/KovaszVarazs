<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderSeedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day' => 'required|integer|in:1,2,3,4,5,6,7|unique',
            'orders' => 'required|array|min:1',
            'orders.*.customer_name' => 'required|string|min:1',
            'orders.*.is_paying' => 'required|boolean',
            'orders.*.order_items' => 'required|array|min:1',
            'orders.*.order_items.*.product_id' => 'required|integer|exists:products,id',
            'orders.*.order_items.*.product_name' => 'required|string',
            'orders.*.order_items.*.quantity' => 'required|integer|min:1',
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
