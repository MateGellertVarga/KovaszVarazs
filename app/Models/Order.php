<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = ['customer_name', 'phone', 'note', 'status', 'date', 'is_paying', 'total_price', 'order_schedule_id'];

    protected $casts = [
        'is_paying' => 'boolean',
    ];

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

    public function getTotalPriceAttribute()
    {
        return $this->orderItems()->with('product')->get()->sum(fn($item) => $item->quantity * $item->product->price);
    }

    public static function boot()
    {
        parent::boot();

        static::saving(function ($order) {
            $order->load('orderItems.product');
            $order->total_price = $order->orderItems->sum(fn($item) => $item->quantity * $item->product->price);
        });
    }
}
