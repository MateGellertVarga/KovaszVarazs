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
            'customer_name' => 'Teszt Elek',
            'phone' => '123456789',
            'note' => 'Házhoz szállítás',
            'status' => 'pending',
            'date' => now(),
        ]);

        OrderItem::insert([
            ['order_id' => $order1->id, 'product_id' => 1, 'quantity' => 2],
            ['order_id' => $order1->id, 'product_id' => 3, 'quantity' => 1],
        ]);

        $order2 = Order::create([
            'customer_name' => 'Minta Béla',
            'phone' => '987654321',
            'note' => 'Személyes átvétel',
            'status' => 'completed',
            'date' => now(),
        ]);

        OrderItem::insert([
            ['order_id' => $order2->id, 'product_id' => 2, 'quantity' => 3],
            ['order_id' => $order2->id, 'product_id' => 5, 'quantity' => 1],
        ]);
    }
}
