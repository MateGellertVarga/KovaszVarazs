<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::insert([
            ['name' => 'Kenyér', 'price' => 5, 'image_url' => 'bread.jpg'],
            ['name' => 'Kis kenyér', 'price' => 4, 'image_url' => 'smallbread.jpg'],
            ['name' => 'Nagy kenyér', 'price' => 7, 'image_url' => 'bigbread.jpg'],
            ['name' => 'Felezős', 'price' => 4, 'image_url' => 'halfbread.jpg'],
            ['name' => 'Rozsos kenyér', 'price' => 5, 'image_url' => 'breadwithcheese.jpg'],
            ['name' => 'Kifli', 'price' => 0.5, 'image_url' => 'kifli.jpg'],
            ['name' => 'Kakaós kifli', 'price' => 1.2, 'image_url' => 'kakaoskifli.jpg'],
            ['name' => 'Csíkos kalács', 'price' => 5, 'image_url' => 'csikoskalacs.jpg'],
        ]);
    }
}
