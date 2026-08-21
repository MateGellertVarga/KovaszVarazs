<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recipe extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'total_dough_amount'];

    public function ingredients()
    {
        return $this->hasMany(Ingredient::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_recipe')->withPivot('quantity');
    }
}
