<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $runLocalSeeders = filter_var((string) env('RUN_LOCAL_SEEDERS', false), FILTER_VALIDATE_BOOLEAN);

        if (! app()->environment('local') || ! $runLocalSeeders) {
            $this->command?->warn('Skipping local-only seeders.');
            return;
        }

        // $this->call([
        //     UserSeeder::class,
        //     ProductSeeder::class,
        //     OrderScheduleSeeder::class,
        //     OrderSeeder::class,
        //     OrderSeedSeeder::class,
        //     CostSeeder::class,
        // ]);
    }
}
