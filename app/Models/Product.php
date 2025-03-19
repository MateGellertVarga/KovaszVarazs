<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;
    public $timestamps = false;
    protected $fillable = ['name', 'price' , 'image_url'];

    public function orderItems(){
        return $this->hasMany(OrderItem::class);
    }

    public function orders(){
        return $this->belongsToMany(Order::class, 'order_items')->withPivot('quantity');
    }
}
