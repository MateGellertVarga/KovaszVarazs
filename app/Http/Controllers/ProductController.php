<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\Storage;

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
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = uniqid() . '.' . $image->getClientOriginalExtension();

            $image->storeAs('products', $filename, 'public');
            $imageUrl = asset('storage/products/' . $filename);
        }

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'image_url' => $imageUrl
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
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $product = Product::findOrFail($id);

        if ($request->hasFile('image')) {
            if ($product->image_url) {
                $oldPath = str_replace(asset('storage/'), '', $product->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $image = $request->file('image');
            $filename = uniqid() . '.' . $image->getClientOriginalExtension();

            $image->storeAs('products', $filename, 'public');
            $product->image_url = asset('storage/products/' . $filename);
        }

        if ($request->has('name')) {
            $product->name = $request->name;
        }

        if ($request->has('price')) {
            $product->price = $request->price;
        }

        $product->save();

        return response()->json($product);
    }

    public function destroy($id)
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $product = Product::findOrFail($id);

        if ($product->image_url) {
            $oldPath = str_replace(asset('storage/'), '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $product->delete();

        return response()->noContent();
    }
}
