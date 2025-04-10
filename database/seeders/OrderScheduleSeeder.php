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
        $sunday = OrderSchedule::create(['available_date' => '2025-04-30']);
        $monday = OrderSchedule::create(['available_date' => '2025-05-01']);
        $tuesday = OrderSchedule::create(['available_date' => '2025-05-02']);

        DB::table('order_schedule_products')->insert([
            ['order_schedule_id' => $sunday->id, 'product_id' => 1, 'max_quantity' => 10, 'remaining_quantity' => 10],
            ['order_schedule_id' => $monday->id, 'product_id' => 1, 'max_quantity' => 10, 'remaining_quantity' => 10],
            ['order_schedule_id' => $monday->id, 'product_id' => 2, 'max_quantity' => 5, 'remaining_quantity' => 5],
            ['order_schedule_id' => $tuesday->id, 'product_id' => 1, 'max_quantity' => 10, 'remaining_quantity' => 10],
        ]);
    }
}
