<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderSeedResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'day' => $this->day,
            'orders' => $this->orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->customer_name,
                    'is_paying' => (bool)$order->is_paying,
                    'order_items' => $order->products->map(function ($product) {
                        return [
                            'product_id' => $product->id,
                            'product_name' => $product->pivot->product_name ?? $product->name,
                            'quantity' => $product->pivot->quantity,
                        ];
                    })->all(),
                ];
            })->all(),
        ];
    }
}
