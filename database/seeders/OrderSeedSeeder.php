<?php

namespace Database\Seeders;

use App\Models\OrderSeed;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        OrderSeed::query()->delete();

        $products = Product::whereIn('name', [
            'Kenyér',
            'Kifli',
            'Kis kenyér',
            'Csíkos kalács',
        ])->get()->keyBy('name');

        if (! isset($products['Kenyér'], $products['Kifli'], $products['Kis kenyér'], $products['Csíkos kalács'])) {
            return;
        }

        $mondaySeed = OrderSeed::create(['day' => 1]);
        $wednesdaySeed = OrderSeed::create(['day' => 3]);
        $fridaySeed = OrderSeed::create(['day' => 5]);

        $orderA = $mondaySeed->orders()->create([
            'customer_name' => 'Minta Tímea',
            'is_paying' => true,
        ]);
        $orderA->products()->attach([
            $products['Kenyér']->id => [
                'product_name' => $products['Kenyér']->name,
                'quantity' => 2,
            ],
            $products['Kifli']->id => [
                'product_name' => $products['Kifli']->name,
                'quantity' => 6,
            ],
        ]);

        $orderB = $wednesdaySeed->orders()->create([
            'customer_name' => 'Minta László',
            'is_paying' => false,
        ]);
        $orderB->products()->attach([
            $products['Kis kenyér']->id => [
                'product_name' => $products['Kis kenyér']->name,
                'quantity' => 2,
            ],
        ]);

        $orderC = $fridaySeed->orders()->create([
            'customer_name' => 'Minta Zsófi',
            'is_paying' => true,
        ]);
        $orderC->products()->attach([
            $products['Csíkos kalács']->id => [
                'product_name' => $products['Csíkos kalács']->name,
                'quantity' => 1,
            ],
            $products['Kenyér']->id => [
                'product_name' => $products['Kenyér']->name,
                'quantity' => 1,
            ],
        ]);
    }
}
