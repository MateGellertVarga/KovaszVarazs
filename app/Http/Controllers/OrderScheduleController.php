<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderSchedule;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\StoreOrderScheduleRequest;
use App\Http\Requests\UpdateOrderScheduleRequest;
use App\Http\Resources\OrderScheduleResource;
use Illuminate\Support\Facades\DB;

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
        $authUser = $request->user();
        if ($authUser->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validated();

        $schedule = OrderSchedule::create([
            'available_date' => $validated['available_date']
        ]);

        foreach ($validated['products'] as $product) {
            $schedule->products()->attach($product['id'], [
                'max_quantity' => $product['max_quantity'],
                'remaining_quantity' => $product['max_quantity']
            ]);
        }

        return (new OrderScheduleResource($schedule->load('products')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateOrderScheduleRequest $request, $id)
    {
        $authUser = $request->user();
        if ($authUser->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return DB::transaction(function () use ($request, $id) {
            $validated = $request->validated();
            $orderSchedule = OrderSchedule::findOrFail($id);

            if (isset($validated['available_date'])) {
                $orderSchedule->update(['available_date' => $validated['available_date']]);
            }

            if (isset($validated['products'])) {
                foreach ($validated['products'] as $product) {
                    $orderedQuantity = DB::table('orders')
                        ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                        ->where('orders.order_schedule_id', $orderSchedule->id)
                        ->where('order_items.product_id', $product['id'])
                        ->sum('order_items.quantity');

                    if ($product['max_quantity'] < $orderedQuantity) {
                        return response()->json(['error' => "New max quantity for product ID {$product['id']} cannot be less than already ordered quantity ($orderedQuantity)."], 400);
                    }
                }

                $orderSchedule->products()->detach();

                foreach ($validated['products'] as $product) {
                    $orderedQuantity = DB::table('orders')
                        ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                        ->where('orders.order_schedule_id', $orderSchedule->id)
                        ->where('order_items.product_id', $product['id'])
                        ->sum('order_items.quantity');

                    $newRemaining = $product['max_quantity'] - $orderedQuantity;

                    $orderSchedule->products()->attach($product['id'], [
                        'max_quantity' => $product['max_quantity'],
                        'remaining_quantity' => $newRemaining
                    ]);
                }
            }

            return new OrderScheduleResource($orderSchedule->load('products'));
        });
    }



    public function destroy($id)
    {
        if (request()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        OrderSchedule::destroy($id);
        return response()->noContent();
    }
}
