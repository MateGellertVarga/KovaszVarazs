<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeedOrder extends Model
{
    public $timestamps = false;
    protected $fillable = ['order_seed_id', 'customer_name', 'is_paying'];
    protected $with = ['products'];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'seed_order_items', 'seed_order_id', 'product_id')
            ->withPivot('product_name', 'quantity');
    }
}
