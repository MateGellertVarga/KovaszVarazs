<?php

namespace Database\Seeders;

use App\Models\OrderSchedule;
use App\Models\OrderScheduleProduct;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class OrderScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $start = Carbon::today()->addDay();

        $scheduleA = OrderSchedule::updateOrCreate(
            ['available_date' => $start->toDateString()],
            ['note' => 'Reggeli kiszállítás']
        );

        $scheduleB = OrderSchedule::updateOrCreate(
            ['available_date' => $start->copy()->addDay()->toDateString()],
            ['note' => 'Nagyobb sütési nap']
        );

        $scheduleC = OrderSchedule::updateOrCreate(
            ['available_date' => $start->copy()->addDays(2)->toDateString()],
            ['note' => 'Normál rendelési nap']
        );

        $productIds = Product::whereIn('name', [
            'Kenyér',
            'Kis kenyér',
            'Nagy kenyér',
            'Kifli',
        ])->pluck('id', 'name');

        $rows = [
            ['order_schedule_id' => $scheduleA->id, 'product_id' => $productIds['Kenyér'] ?? null, 'max_quantity' => 30, 'remaining_quantity' => 30],
            ['order_schedule_id' => $scheduleA->id, 'product_id' => $productIds['Kifli'] ?? null, 'max_quantity' => 60, 'remaining_quantity' => 60],
            ['order_schedule_id' => $scheduleB->id, 'product_id' => $productIds['Kenyér'] ?? null, 'max_quantity' => 40, 'remaining_quantity' => 40],
            ['order_schedule_id' => $scheduleB->id, 'product_id' => $productIds['Kis kenyér'] ?? null, 'max_quantity' => 20, 'remaining_quantity' => 20],
            ['order_schedule_id' => $scheduleB->id, 'product_id' => $productIds['Nagy kenyér'] ?? null, 'max_quantity' => 15, 'remaining_quantity' => 15],
            ['order_schedule_id' => $scheduleC->id, 'product_id' => $productIds['Kenyér'] ?? null, 'max_quantity' => 25, 'remaining_quantity' => 25],
        ];

        foreach ($rows as $row) {
            if (! $row['product_id']) {
                continue;
            }

            OrderScheduleProduct::updateOrCreate(
                [
                    'order_schedule_id' => $row['order_schedule_id'],
                    'product_id' => $row['product_id'],
                ],
                [
                    'max_quantity' => $row['max_quantity'],
                    'remaining_quantity' => $row['remaining_quantity'],
                ]
            );
        }
    }
}
