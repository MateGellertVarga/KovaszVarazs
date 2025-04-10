<?php

namespace App\Http\Controllers;

use App\Models\Cost;
use App\Http\Requests\StoreCostRequest;
use App\Http\Requests\UpdateCostRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CostController extends Controller
{

    public function index(Request $request)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        return response()->json(Cost::all());
    }

    public function store(StoreCostRequest $request)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $cost = Cost::create($request->validated());
        return response()->json($cost, Response::HTTP_CREATED);
    }

    public function show(Request $request, $id)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        return response()->json(Cost::findOrFail($id));
    }

    public function update(UpdateCostRequest $request, $id)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        $cost = Cost::findOrFail($id);
        $cost->update($request->validated());
        return response()->json($cost);
    }

    public function destroy(Request $request, $id)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        Cost::destroy($id);
        return response()->noContent();
    }
}
