<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Http\Requests\StoreRecipeRequest;
use App\Http\Requests\UpdateRecipeRequest;
use App\Http\Resources\RecipeResource;
use App\Models\OrderSchedule;

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

    public function calculateForSchedule($id)
    {
        $authUser = request()->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez!'], 401);
        }

        $schedule = OrderSchedule::with('products')->findOrFail($id);
        $recipes = Recipe::with(['ingredients', 'products'])->get();
        $doughTotals = [];
        $missingProducts = [];
        $grandTotalIngredients = [];

        foreach ($schedule->products as $scheduleProduct) {
            $maxQuantity = $scheduleProduct->pivot->max_quantity;
            $productRecipes = $recipes->filter(function ($r) use ($scheduleProduct) {
                return $r->products->contains('id', $scheduleProduct->id);
            });

            if ($productRecipes->isEmpty()) {
                $missingProducts[] = $scheduleProduct->name;
            } else {
                foreach ($productRecipes as $recipe) {
                    $pivot = $recipe->products->firstWhere('id', $scheduleProduct->id)->pivot;
                    $neededDough = $maxQuantity * $pivot->quantity;

                    if (!isset($doughTotals[$recipe->id])) {
                        $doughTotals[$recipe->id] = [
                            'recipe_name' => $recipe->name,
                            'total_grams' => 0,
                            'ingredients' => []
                        ];
                    }
                    $doughTotals[$recipe->id]['total_grams'] += $neededDough;
                }
            }
        }

        foreach ($doughTotals as $recipeId => &$doughData) {
            $recipe = $recipes->firstWhere('id', $recipeId);

            if ($recipe->total_dough_amount > 0) {
                $ratio = $doughData['total_grams'] / $recipe->total_dough_amount;

                foreach ($recipe->ingredients as $ingredient) {
                    $calculatedAmount = round($ingredient->amount * $ratio, 1);
                    $doughData['ingredients'][] = [
                        'name' => $ingredient->name,
                        'amount' => $calculatedAmount
                    ];

                    if (!isset($grandTotalIngredients[$ingredient->name])) {
                        $grandTotalIngredients[$ingredient->name] = 0;
                    }
                    $grandTotalIngredients[$ingredient->name] += $calculatedAmount;
                }
            }
        }
        $formattedGrandTotals = [];
        foreach ($grandTotalIngredients as $name => $amount) {
            $formattedGrandTotals[] = ['name' => $name, 'amount' => round($amount, 1)];
        }

        return response()->json([
            'recipes' => array_values($doughTotals),
            'grand_total_ingredients' => $formattedGrandTotals,
            'missing_products' => array_values(array_unique($missingProducts))
        ]);
    }
}
