<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    // Ha nem szeretnéd, hogy "data" kulcsba legyen csomagolva az eredmény, beállíthatod:
    public static $wrap = null;

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
            'customer_name' => $this->customer_name,
            'phone' => $this->phone,
            'note' => $this->note,
            'status' => $this->status,
            'date' => $this->date,
            'is_paying' => $this->is_paying,
            'total_price' => $this->total_price,
            'order_schedule_id' => $this->order_schedule_id,
            'order_schedule_date' => optional($this->orderSchedule)->available_date,
            'order_items' => $this->orderItems->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'product_name' => optional($item->product)->name,
                    'quantity' => $item->quantity,
                ];
            })->all(),
        ];
    }
}
