<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'available_date' => $this->available_date,
            'products' => $this->products->map(function($product) {
                return [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'max_quantity' => $product->pivot->max_quantity,
                ];
            })->all(),
        ];
    }
}
