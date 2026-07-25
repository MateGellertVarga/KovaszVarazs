<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderSchedule extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'available_date', 'note'];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_schedule_products')
            ->withPivot('max_quantity', 'remaining_quantity');
    }
}
