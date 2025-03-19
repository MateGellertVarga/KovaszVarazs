<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;
    public $timestamps = false;
    protected $fillable = ['customer_name', 'phone', 'note', 'status', 'date'];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_items')->withPivot('quantity');
    }

    public function orderSchedule()
    {
        return $this->belongsTo(OrderSchedule::class);
    }
}
