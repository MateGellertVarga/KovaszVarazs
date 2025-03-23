<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name'         => 'Admin',
            'email'        => 'admin@admin.com',
            'phone_number' => '111222333',
            'password'     => Hash::make('admin'),
            'role'         => 'admin'
        ]);

        User::create([
            'name'         => 'Béla',
            'email'        => 'bela@gmail.com',
            'phone_number' => '444555666',
            'password'     => Hash::make('bela'),
            'role'         => 'user'
        ]);
    }
}
