<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderSchedule;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\StoreOrderScheduleRequest;
use App\Http\Requests\UpdateOrderScheduleRequest;

class OrderScheduleController extends Controller
{
    public function index()
    {
        return response()->json(OrderSchedule::with('products')->get());
    }

    public function show($id)
    {
        return response()->json(OrderSchedule::with('products')->find($id));
    }

    public function store(StoreOrderScheduleRequest $request)
    {
        $validated = $request->validated();

        $schedule = OrderSchedule::create([
            'available_date' => $validated['available_date']
        ]);

        foreach ($validated['products'] as $product) {
            $schedule->products()->attach($product['id'], ['max_quantity' => $product['max_quantity']]);
        }

        return response()->json($schedule->load('products'), 201);
    }

    public function update(UpdateOrderScheduleRequest $request, OrderSchedule $orderSchedule)
{
    $validated = $request->validated();
    $orderSchedule->update([
        'available_date' => $validated['available_date']
    ]);

    $orderSchedule->products()->sync([]);
    foreach ($validated['products'] as $product) {
        $orderSchedule->products()->attach($product['id'], ['max_quantity' => $product['max_quantity']]);
    }

    return response()->json($orderSchedule->load('products'));
}

    public function destroy($id)
    {
        OrderSchedule::destroy($id);
        return response()->noContent();
    }
}
