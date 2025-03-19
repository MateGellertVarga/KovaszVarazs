<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\OrderSchedule;
use App\Http\Resources\OrderResource;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['orderItems.product', 'orderSchedule'])->get();
        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request)
    {
        $orderSchedule = OrderSchedule::find($request->order_schedule_id);
        if (!$orderSchedule) {
            return response()->json(['error' => 'Invalid order_schedule_id'], 400);
        }

        $order = Order::create($request->validated());

        if ($request->has('order_items')) {
            foreach ($request->order_items as $item) {
                $order->orderItems()->create($item);
            }
        }

        $order->update([
            'total_price' => $order->orderItems->sum(fn($item) => $item->quantity * $item->product->price)
        ]);

        $order->load(['orderItems.product', 'orderSchedule']);
        return new OrderResource($order);
    }

    public function show($id)
    {
        $order = Order::with(['orderItems.product', 'orderSchedule'])->findOrFail($id);
        return new OrderResource($order);
    }

    public function update(UpdateOrderRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->validated());

        $order->update([
            'total_price' => $order->orderItems->sum(fn($item) => $item->quantity * $item->product->price)
        ]);

        $order->load(['orderItems.product', 'orderSchedule']);
        return new OrderResource($order);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->noContent();
    }
}
