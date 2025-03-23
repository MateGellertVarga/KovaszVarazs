<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderScheduleProduct extends Model
{
    public $timestamps = false;
    protected $fillable = ['order_schedule_id', 'product_id', 'max_quantity', 'remaining_quantity'];
}
