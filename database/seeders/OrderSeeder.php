<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $order1 = Order::create([
            'user_id' => 2,
            'note' => 'Kérlek, gyorsan készítsd el!',
            'status' => 'pending',
            'is_paying' => true,
            'total_price' => 0,
            'order_schedule_id' => 1,
        ]);

        OrderItem::insert([
            ['order_id' => $order1->id, 'product_id' => 1, 'quantity' => 2],
            ['order_id' => $order1->id, 'product_id' => 3, 'quantity' => 1],
        ]);

        $order2 = Order::create([
            'customer_name' => 'Minta Béla',
            'phone_number' => '987654321',
            'note' => 'Személyes átvétel',
            'status' => 'completed',
            'is_paying' => false,
            'total_price' => 0,
            'order_schedule_id' => 2,
        ]);

        OrderItem::insert([
            ['order_id' => $order2->id, 'product_id' => 2, 'quantity' => 3],
            ['order_id' => $order2->id, 'product_id' => 5, 'quantity' => 1],
        ]);
    }
}
