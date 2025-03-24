<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cost extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'month',
        'name',
        'amount',
    ];
}
