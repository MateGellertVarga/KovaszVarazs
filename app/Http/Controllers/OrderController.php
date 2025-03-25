<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderSchedule;
use App\Models\Product;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            $orders = Order::with(['orderItems.product', 'orderSchedule', 'user'])->get();
        } else {
            $orders = Order::with(['orderItems.product', 'orderSchedule', 'user'])
                ->where('user_id', $user->id)
                ->get();
        }
        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request)
    {
        $orderSchedule = OrderSchedule::find($request->order_schedule_id);
        if (!$orderSchedule) {
            return response()->json(['error' => 'Nem található a sütési időpont'], 400);
        }

        $data = $request->validated();

        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
            $data['customer_name'] = $data['customer_name'] ?? null;
            $data['phone_number'] = $data['phone_number'] ?? null;
        }

        return DB::transaction(function () use ($data, $request) {
            $order = Order::create($data);

            $orderItems = [];
            foreach ($request->order_items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $item['unit_price'] = $product->price;
                $orderItems[] = $order->orderItems()->create($item);
            }

            $order->refresh();
            $order->update([
                'total_price' => collect($orderItems)->sum(fn($item) => $item->quantity * $item->unit_price)
            ]);

            foreach ($orderItems as $orderItem) {
                $remaining = DB::table('order_schedule_products')
                    ->where('order_schedule_id', $order->order_schedule_id)
                    ->where('product_id', $orderItem->product_id)
                    ->value('remaining_quantity');

                if ($remaining < $orderItem->quantity) {
                    return response()->json(['error' => "Nincs elég szabad termék: {$orderItem->product_name}"], 400);
                }

                DB::table('order_schedule_products')
                    ->where('order_schedule_id', $order->order_schedule_id)
                    ->where('product_id', $orderItem->product_id)
                    ->decrement('remaining_quantity', $orderItem->quantity);
            }

            $order->load(['orderItems.product', 'orderSchedule', 'user']);
            return new OrderResource($order);
        });
    }

    public function show(Request $request, $id)
    {
        $order = Order::with(['orderItems.product', 'orderSchedule', 'user'])->findOrFail($id);
        $user = $request->user();
        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        return new OrderResource($order);
    }

    public function update(UpdateOrderRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $authUser = $request->user();

        if ($authUser->role !== 'admin' && $order->user_id !== $authUser->id) {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $oldOrderItems = $order->orderItems()->get();
        $orderItemsData = collect($request->order_items);

        $order->update($request->validated());

        if ($request->has('order_items')) {
            foreach ($oldOrderItems as $existingItem) {
                DB::table('order_schedule_products')
                    ->where('order_schedule_id', $order->order_schedule_id)
                    ->where('product_id', $existingItem->product_id)
                    ->increment('remaining_quantity', $existingItem->quantity);
            }

            $order->orderItems()->delete();

            foreach ($orderItemsData as $item) {
                if ($item['quantity'] > 0) {
                    $product = Product::findOrFail($item['product_id']);
                    $item['unit_price'] = $product->price;

                    $remaining = DB::table('order_schedule_products')
                        ->where('order_schedule_id', $order->order_schedule_id)
                        ->where('product_id', $item['product_id'])
                        ->value('remaining_quantity');

                    if ($remaining < $item['quantity']) {
                        return response()->json(['error' => "Nincs elég szabad termék: {$product->name}"], 400);
                    }

                    DB::table('order_schedule_products')
                        ->where('order_schedule_id', $order->order_schedule_id)
                        ->where('product_id', $item['product_id'])
                        ->decrement('remaining_quantity', $item['quantity']);

                    $order->orderItems()->create($item);
                }
            }
        }

        $order->update([
            'total_price' => $order->orderItems->sum(fn($item) => $item->quantity * $item->unit_price)
        ]);

        $order->load(['orderItems.product', 'orderSchedule', 'user']);
        return new OrderResource($order);
    }


    public function destroy(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $authUser = $request->user();

        if ($authUser->role !== 'admin' && $order->user_id !== $authUser->id) {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        foreach ($order->orderItems as $orderItem) {
            DB::table('order_schedule_products')
                ->where('order_schedule_id', $order->order_schedule_id)
                ->where('product_id', $orderItem->product_id)
                ->increment('remaining_quantity', $orderItem->quantity);
        }

        $order->delete();

        return response()->noContent();
    }
}
