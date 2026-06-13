<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Kenyér',
                'price' => 5.00,
                'image_url' => 'bread.jpg',
                'category' => 'kenyer',
                'is_used' => true,
                'allergens' => 'glutén',
                'description' => 'Hagyományos fehér kenyér.',
            ],
            [
                'name' => 'Kis kenyér',
                'price' => 4.00,
                'image_url' => 'smallbread.jpg',
                'category' => 'kenyer',
                'is_used' => true,
                'allergens' => 'glutén',
                'description' => 'Kisebb méretű kenyér.',
            ],
            [
                'name' => 'Nagy kenyér',
                'price' => 7.00,
                'image_url' => 'bigbread.jpg',
                'category' => 'kenyer',
                'is_used' => true,
                'allergens' => 'glutén',
                'description' => 'Nagy méretű, családi kenyér.',
            ],
            [
                'name' => 'Felezős',
                'price' => 4.00,
                'image_url' => 'halfbread.jpg',
                'category' => 'kenyer',
                'is_used' => true,
                'allergens' => 'glutén',
                'description' => 'Fél kenyér praktikus kiszerelésben.',
            ],
            [
                'name' => 'Rozsos kenyér',
                'price' => 5.50,
                'image_url' => 'breadwithcheese.jpg',
                'category' => 'kenyer',
                'is_used' => true,
                'allergens' => 'glutén',
                'description' => 'Rozsliszttel készült kenyér.',
            ],
            [
                'name' => 'Kifli',
                'price' => 0.50,
                'image_url' => 'kifli.jpg',
                'category' => 'peksutemeny',
                'is_used' => true,
                'allergens' => 'glutén',
                'description' => 'Ropogós kifli.',
            ],
            [
                'name' => 'Kakaós kifli',
                'price' => 1.20,
                'image_url' => 'kakaoskifli.jpg',
                'category' => 'peksutemeny',
                'is_used' => true,
                'allergens' => 'glutén, tej',
                'description' => 'Édes, kakaós töltelékes kifli.',
            ],
            [
                'name' => 'Csíkos kalács',
                'price' => 5.00,
                'image_url' => 'csikoskalacs.jpg',
                'category' => 'kalacs',
                'is_used' => true,
                'allergens' => 'glutén, tej, tojás',
                'description' => 'Kakaós csíkos kalács.',
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['name' => $product['name']],
                $product
            );
        }
    }
}
