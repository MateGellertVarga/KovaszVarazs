<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderItemRequest;
use App\Http\Requests\UpdateOrderItemRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class OrderItemController extends Controller
{
    public function index($orderId)
    {
        $order = Order::findOrFail($orderId);
        $authUser = request()->user();
        if ($authUser->role !== 'admin' && $order->user_id !== $authUser->id) {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        return OrderItem::where('order_id', $orderId)->get();
    }

    public function store(StoreOrderItemRequest $request, $orderId)
    {
        $order = Order::findOrFail($orderId);
        $authUser = request()->user();
        if ($authUser->role !== 'admin' && $order->user_id !== $authUser->id) {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        $data = $request->validated();
        $product = Product::findOrFail($data['product_id']);
        $data['unit_price'] = $product->price;
        return $order->orderItems()->create($data);
    }

    public function show($orderId, $id)
    {
        $orderItem = OrderItem::findOrFail($id);
        if ($orderItem->order_id != $orderId) {
            abort(404);
        }
        $authUser = request()->user();
        if ($authUser->role !== 'admin' && $orderItem->order->user_id !== $authUser->id) {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        return $orderItem;
    }

    public function update(UpdateOrderItemRequest $request, $orderId, $id)
    {
        $orderItem = OrderItem::findOrFail($id);
        if ($orderItem->order_id != $orderId) {
            abort(404);
        }
        $authUser = request()->user();
        if ($authUser->role !== 'admin' && $orderItem->order->user_id !== $authUser->id) {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        $data = $request->validated();
        if (isset($data['product_id'])) {
            $product = Product::findOrFail($data['product_id']);
            $data['unit_price'] = $product->price;
        }
        $orderItem->update($data);
        return $orderItem;
    }

    public function destroy($orderId, $id)
    {
        $orderItem = OrderItem::findOrFail($id);
        if ($orderItem->order_id != $orderId) {
            abort(404);
        }
        $authUser = request()->user();
        if ($authUser->role !== 'admin' && $orderItem->order->user_id !== $authUser->id) {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        $orderItem->delete();
        return response()->noContent();
    }
}
