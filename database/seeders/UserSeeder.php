<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name'         => 'Admin',
                'phone_number' => '111222333',
                'password'     => Hash::make('admin'),
                'role'         => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'bela@gmail.com'],
            [
                'name'         => 'Béla',
                'phone_number' => '444555666',
                'password'     => Hash::make('bela'),
                'role'         => 'user',
            ]
        );
    }
}
