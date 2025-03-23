<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;

class ProductController extends Controller
{
    public function index()
    {
        return Product::all();
    }

    public function store(StoreProductRequest $request)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        return Product::create($request->validated());
    }

    public function show($id)
    {
        return Product::findOrFail($id);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $product = Product::findOrFail($id);
        $product->update($request->validated());
        return $product;
    }

    public function destroy($id)
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->noContent();
    }
}
