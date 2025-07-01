<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        $imageUrl = $this->handleImageUpload($request);

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
            $this->deleteImageIfExists($product->image_url);
            $product->image_url = $this->handleImageUpload($request);
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

        $this->deleteImageIfExists($product->image_url);
        $product->delete();

        return response()->noContent();
    }

    protected function handleImageUpload($request): ?string
    {
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('', 'images');
            return Storage::url($path);
        }
        return null;
    }

    protected function deleteImageIfExists(?string $url): void
    {
        if ($url) {
            $filename = Str::after($url, env('AWS_URL') . '/');
            Storage::disk('images')->delete($filename);
        }
    }
}
