<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\OrderSchedule;
use Illuminate\Support\Facades\DB;

class OrderScheduleSeeder extends Seeder
{
    public function run()
    {
        $monday = OrderSchedule::create(['available_date' => '2024-03-25']);
        $friday = OrderSchedule::create(['available_date' => '2024-03-29']);

        DB::table('order_schedule_products')->insert([
            ['order_schedule_id' => $monday->id, 'product_id' => 1, 'max_quantity' => 10, 'remaining_quantity' => 10],
            ['order_schedule_id' => $monday->id, 'product_id' => 2, 'max_quantity' => 5, 'remaining_quantity' => 5],
            ['order_schedule_id' => $friday->id, 'product_id' => 3, 'max_quantity' => 8, 'remaining_quantity' => 8],
            ['order_schedule_id' => $friday->id, 'product_id' => 4, 'max_quantity' => 6, 'remaining_quantity' => 6],
            ['order_schedule_id' => $friday->id, 'product_id' => 5, 'max_quantity' => 12, 'remaining_quantity' => 12],
            ['order_schedule_id' => $friday->id, 'product_id' => 6, 'max_quantity' => 7, 'remaining_quantity' => 7],
            ['order_schedule_id' => $friday->id, 'product_id' => 7, 'max_quantity' => 9, 'remaining_quantity' => 9],
            ['order_schedule_id' => $friday->id, 'product_id' => 8, 'max_quantity' => 11, 'remaining_quantity' => 11],
        ]);
    }
}
