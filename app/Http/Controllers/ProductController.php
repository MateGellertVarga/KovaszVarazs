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

            $path = $image->storeAs('products', $filename, 'images');
            $imageUrl = 'https://367be3a2035528943240074d0096e0cd.r2.cloudflarestorage.com/fls-9eaec0c7-9471-4769-8e31-3f5526df4eae' . '/' . ltrim($path, '/');
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
                $baseUrl = rtrim(config('filesystems.disks.images.url'), '/') . '/';
                $relativePath = str_replace($baseUrl, '', $product->image_url);
                Storage::disk('images')->delete($relativePath);
            }

            $image = $request->file('image');
            $filename = uniqid() . '.' . $image->getClientOriginalExtension();

            $path = $image->storeAs('products', $filename, 'images');
            $product->image_url = 'https://367be3a2035528943240074d0096e0cd.r2.cloudflarestorage.com/fls-9eaec0c7-9471-4769-8e31-3f5526df4eae' . '/' . ltrim($path, '/');
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
            $baseUrl = rtrim(config('filesystems.disks.images.url'), '/') . '/';
            $relativePath = str_replace($baseUrl, '', $product->image_url);
            Storage::disk('images')->delete($relativePath);
        }

        $product->delete();

        return response()->noContent();
    }
}
