<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with('orderItems')->get();
    }

    public function store(StoreOrderRequest $request)
    {
        $order = Order::create($request->validated());
        if ($request->has('order_items')) {
            foreach ($request->order_items as $item) {
                $order->orderItems()->create($item);
            }
        }
        return $order->load('orderItems');
    }

    public function show($id)
    {
        return Order::with('orderItems')->find($id);
    }

    public function update(UpdateOrderRequest $request, $id)
    {
        $order = Order::find($id);
        try {
            $order->update($request->validated());
        } catch (\Throwable $th) {
            dd($th);
        }
        return $order->load('orderItems');
    }

    public function destroy($id)
    {
        $order = Order::find($id);
        $order->delete();
        return response()->noContent();
    }
}
