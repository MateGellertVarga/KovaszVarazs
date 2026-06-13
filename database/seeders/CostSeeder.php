<?php

namespace Database\Seeders;

use App\Models\Cost;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class CostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $month = Carbon::today()->startOfMonth()->toDateString();

        Cost::updateOrCreate(
            ['month' => $month, 'name' => 'Liszt'],
            ['amount' => 100]
        );

        Cost::updateOrCreate(
            ['month' => $month, 'name' => 'Élesztő'],
            ['amount' => 45]
        );
    }
}
