<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Http\Requests\StoreRecipeRequest;
use App\Http\Requests\UpdateRecipeRequest;
use App\Http\Resources\RecipeResource;

class RecipeController extends Controller
{
    public function index()
    {
        $recipes = Recipe::with(['ingredients', 'products'])->get();
        return RecipeResource::collection($recipes);
    }

    public function store(StoreRecipeRequest $request)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $recipe = Recipe::create($request->only(['name', 'total_dough_amount']));

        if ($request->has('ingredients')) {
            foreach ($request->ingredients as $ingredient) {
                $recipe->ingredients()->create($ingredient);
            }
        }

        if ($request->has('products')) {
            $syncData = [];
            foreach ($request->products as $product) {
                $syncData[$product['product_id']] = ['quantity' => $product['quantity']];
            }
            $recipe->products()->sync($syncData);
        }

        return new RecipeResource($recipe->load(['ingredients', 'products']));
    }

    public function update(UpdateRecipeRequest $request, $id)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $recipe = Recipe::findOrFail($id);
        $recipe->update($request->only(['name', 'total_dough_amount']));

        if ($request->has('ingredients')) {
            $recipe->ingredients()->delete();
            foreach ($request->ingredients as $ingredient) {
                $recipe->ingredients()->create($ingredient);
            }
        }

        if ($request->has('products')) {
            $syncData = [];
            foreach ($request->products as $product) {
                $syncData[$product['product_id']] = ['quantity' => $product['quantity']];
            }
            $recipe->products()->sync($syncData);
        }

        return new RecipeResource($recipe->load(['ingredients', 'products']));
    }

    public function destroy($id)
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $recipe = Recipe::findOrFail($id);
        $recipe->delete();

        return response()->noContent();
    }
}
