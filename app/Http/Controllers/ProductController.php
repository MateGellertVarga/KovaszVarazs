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
        return Product::with('recipes')->get();
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
            'image_url' => $imageUrl,
            'category' => $request->category,
            'is_used' => $request->is_used,
            'allergens' => $request->allergens,
            'description' => $request->description,
        ]);

        if ($request->has('recipes')) {
            $recipesData = json_decode($request->recipes, true);
            $syncData = [];

            if (is_array($recipesData)) {
                foreach ($recipesData as $recipe) {
                    $syncData[$recipe['recipe_id']] = ['quantity' => $recipe['quantity']];
                }
            }
            $product->recipes()->sync($syncData);
        }

        return response()->json($product, 201);
    }

    public function show($id)
    {
        return Product::with('recipes')->findOrFail($id);
    }

    public function update(UpdateProductRequest $request, $id)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $product = Product::with('recipes')->findOrFail($id);

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

        if ($request->has('category')) {
            $product->category = $request->category;
        }

        if ($request->has('is_used')) {
            $product->is_used = $request->is_used;
        }
        if ($request->has('allergens')) {
            $product->allergens = $request->allergens;
        }
        if ($request->has('description')) {
            $product->description = $request->description;
        }

        $product->save();

        if ($request->has('recipes')) {
            $recipesData = json_decode($request->recipes, true);
            $syncData = [];

            if (is_array($recipesData)) {
                foreach ($recipesData as $recipe) {
                    $syncData[$recipe['recipe_id']] = ['quantity' => $recipe['quantity']];
                }
            }
            $product->recipes()->sync($syncData);
        }
        return response()->json($product);
    }

    public function destroy($id)
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $product = Product::with('recipes')->findOrFail($id);

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
            if (env('IMAGES_DISK_DRIVER', 's3') === 'local') {
                $filename = Str::after($url, rtrim(env('APP_URL', ''), '/') . '/storage/');

                if ($filename === $url) {
                    $filename = Str::after($url, '/storage/');
                }

                Storage::disk('images')->delete($filename);

                return;
            }

            $filename = Str::after($url, rtrim(env('AWS_URL', ''), '/') . '/');
            Storage::disk('images')->delete($filename);
        }
    }
}
