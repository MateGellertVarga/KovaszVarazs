<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderSeed extends Model
{
    public $timestamps = false;
    protected $fillable = ['day'];
    protected $with = ['orders'];

    public function orders()
    {
        return $this->hasMany(SeedOrder::class, 'order_seed_id');
    }
}
