<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = [
        'user_id',
        'customer_name',
        'phone_number',
        'note',
        'status',
        'is_paying',
        'total_price',
        'order_schedule_id',
    ];

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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function gettotal_priceAttribute()
    {
        $this->loadMissing('orderItems.product');

        if (!$this->is_paying) {
            return 0;
        }

        if ($this->status === 'completed') {
            return $this->orderItems->sum(fn($item) => $item->quantity * $item->unit_price);
        } else {
            return $this->orderItems->sum(fn($item) => $item->quantity * $item->product->price);
        }
    }
}
