<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Http\Requests\StoreOrderItemRequest;
use App\Http\Requests\UpdateOrderItemRequest;

class OrderItemController extends Controller
{
    public function index($id)
    {
        return OrderItem::where('order_id', $id)->get();
    }

    public function store(StoreOrderItemRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        return $order->orderItems()->create($request->validated());
    }

    public function show($orderId, $id)
    {
        $orderItem = OrderItem::findOrFail($id);
        if ($orderItem->order_id != $orderId) {
            abort(404);
        }
        return $orderItem;
    }

    public function update(UpdateOrderItemRequest $request, $orderId, $id)
    {
        $orderItem = OrderItem::findOrFail($id);
        if ($orderItem->order_id != $orderId) {
            abort(404);
        }
        $orderItem->update($request->validated());
        return $orderItem;
    }

    public function destroy($orderId, $id)
    {
        $orderItem = OrderItem::findOrFail($id);
        if ($orderItem->order_id != $orderId) {
            abort(404);
        }
        $orderItem->delete();
        return response()->noContent();
    }
}
