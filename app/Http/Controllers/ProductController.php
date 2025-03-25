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
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'image_url' => $imagePath ? asset('storage/' . $imagePath) : null
        ]);

        return response()->json($product, 201);
    }


    public function show($id)
    {
        return Product::findOrFail($id);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $product = Product::findOrFail($id);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $product->image_url = asset('storage/' . $imagePath);
        }

        $product->update($request->except('image'));

        return response()->json($product);
    }


    public function destroy($id)
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->noContent();
    }
}
