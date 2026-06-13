<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderSchedule;
use App\Models\OrderScheduleProduct;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        OrderItem::query()->delete();
        Order::query()->delete();

        OrderScheduleProduct::query()->each(function (OrderScheduleProduct $row) {
            $row->update(['remaining_quantity' => $row->max_quantity]);
        });

        $bela = User::where('email', 'bela@gmail.com')->first();
        $schedules = OrderSchedule::orderBy('available_date')->take(3)->get();

        if ($schedules->count() < 3) {
            return;
        }

        $products = Product::whereIn('name', [
            'Kenyér',
            'Nagy kenyér',
            'Kis kenyér',
            'Rozsos kenyér',
        ])->get()->keyBy('name');

        if (! isset($products['Kenyér'], $products['Nagy kenyér'], $products['Kis kenyér'], $products['Rozsos kenyér'])) {
            return;
        }

        $order1 = Order::create([
            'user_id' => $bela?->id,
            'customer_name' => $bela?->name,
            'phone_number' => $bela?->phone_number,
            'note' => 'Kérlek, gyorsan készítsd el!',
            'status' => 'pending',
            'is_paying' => true,
            'already_paid' => false,
            'total_price' => 0,
            'order_schedule_id' => $schedules[0]->id,
        ]);

        $order2 = Order::create([
            'customer_name' => 'Minta Béla',
            'phone_number' => '987654321',
            'note' => 'Személyes átvétel',
            'status' => 'pending',
            'is_paying' => false,
            'already_paid' => false,
            'total_price' => 0,
            'order_schedule_id' => $schedules[1]->id,
        ]);

        $order3 = Order::create([
            'user_id' => $bela?->id,
            'customer_name' => $bela?->name,
            'phone_number' => $bela?->phone_number,
            'note' => 'Másnapi rendelés',
            'status' => 'completed',
            'is_paying' => true,
            'already_paid' => true,
            'total_price' => 0,
            'order_schedule_id' => $schedules[2]->id,
        ]);

        $items = [
            [
                'order' => $order1,
                'schedule_id' => $schedules[0]->id,
                'product' => $products['Kenyér'],
                'quantity' => 2,
            ],
            [
                'order' => $order1,
                'schedule_id' => $schedules[0]->id,
                'product' => $products['Nagy kenyér'],
                'quantity' => 1,
            ],
            [
                'order' => $order2,
                'schedule_id' => $schedules[1]->id,
                'product' => $products['Kis kenyér'],
                'quantity' => 3,
            ],
            [
                'order' => $order2,
                'schedule_id' => $schedules[1]->id,
                'product' => $products['Rozsos kenyér'],
                'quantity' => 1,
            ],
            [
                'order' => $order3,
                'schedule_id' => $schedules[2]->id,
                'product' => $products['Kenyér'],
                'quantity' => 1,
            ],
        ];

        foreach ($items as $item) {
            $unitPrice = (float) $item['product']->price;

            OrderItem::create([
                'order_id' => $item['order']->id,
                'product_id' => $item['product']->id,
                'quantity' => $item['quantity'],
                'unit_price' => $unitPrice,
            ]);

            $scheduleProduct = OrderScheduleProduct::where('order_schedule_id', $item['schedule_id'])
                ->where('product_id', $item['product']->id)
                ->first();

            if ($scheduleProduct) {
                $scheduleProduct->update([
                    'remaining_quantity' => max(0, $scheduleProduct->remaining_quantity - $item['quantity']),
                ]);
            }
        }

        $order1->update(['total_price' => 2 * (float) $products['Kenyér']->price + 1 * (float) $products['Nagy kenyér']->price]);
        $order2->update(['total_price' => 0]);
        $order3->update(['total_price' => 1 * (float) $products['Kenyér']->price]);
    }
}
