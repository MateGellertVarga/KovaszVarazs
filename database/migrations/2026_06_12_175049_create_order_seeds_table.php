<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_seeds', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('day')->unique();
        });

        Schema::create('seed_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_seed_id')->constrained('order_seeds')->onDelete('cascade');
            $table->string('customer_name');
            $table->boolean('is_paying')->default(true);
        });

        Schema::create('seed_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seed_order_id')->constrained('seed_orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('product_name');
            $table->integer('quantity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seed_order_items');
        Schema::dropIfExists('seed_orders');
        Schema::dropIfExists('order_seeds');
    }
};
