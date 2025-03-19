<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderSchedule;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\StoreOrderScheduleRequest;
use App\Http\Requests\UpdateOrderScheduleRequest;
use App\Http\Resources\OrderScheduleResource;

class OrderScheduleController extends Controller
{
    public function index()
    {
        $schedules = OrderSchedule::with('products')->get();
        return OrderScheduleResource::collection($schedules);
    }

    public function show($id)
    {
        $schedule = OrderSchedule::with('products')->findOrFail($id);
        return new OrderScheduleResource($schedule);
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

        return (new OrderScheduleResource($schedule->load('products')))
                    ->response()
                    ->setStatusCode(Response::HTTP_CREATED);
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

        return new OrderScheduleResource($orderSchedule->load('products'));
    }

    public function destroy($id)
    {
        OrderSchedule::destroy($id);
        return response()->noContent();
    }
}
