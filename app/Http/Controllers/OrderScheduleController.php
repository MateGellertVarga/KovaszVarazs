<?php

namespace App\Http\Controllers;

use App\Events\OrdersChanged;
use App\Events\OrderSchedulesChanged;
use Illuminate\Http\Request;
use App\Models\OrderSchedule;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\StoreOrderScheduleRequest;
use App\Http\Requests\UpdateOrderScheduleRequest;
use App\Http\Resources\OrderScheduleResource;
use App\Models\Order;
use App\Models\OrderSeed;
use AWS\CRT\Log;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class OrderScheduleController extends Controller
{
    public function index(Request $request)
    {
        $before = intval($request->input('before', 25));
        $after = intval($request->input('after', 75));
        $today = now()->startOfDay();

        $past = OrderSchedule::where('available_date', '<', $today)
            ->orderBy('available_date', 'desc')
            ->take($before)
            ->get()
            ->reverse();

        $upcoming = OrderSchedule::where('available_date', '>=', $today)
            ->orderBy('available_date', 'asc')
            ->take($after)
            ->get();

        $schedules = $past->concat($upcoming)->values();

        return OrderScheduleResource::collection($schedules);
    }

    public function show($id)
    {
        $schedule = OrderSchedule::with(['products' => function ($query) {
            $query->where('is_used', true);
        }])->findOrFail($id);

        return new OrderScheduleResource($schedule);
    }

    public function store(StoreOrderScheduleRequest $request)
    {
        $authUser = $request->user();
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $validated = $request->validated();
        $date = Carbon::parse($validated['available_date']);
        $dayOfWeek = $date->dayOfWeekIso;

        $seed = OrderSeed::where('day', $dayOfWeek)->with('orders.products')->first();

        DB::beginTransaction();
        try {
            $schedule = OrderSchedule::create([
                'available_date' => $validated['available_date'],
                'note' => $validated['note']
            ]);

            foreach ($validated['products'] as $product) {
                $schedule->products()->attach($product['id'], [
                    'max_quantity' => $product['max_quantity'],
                    'remaining_quantity' => $product['max_quantity']
                ]);
            }

            if ($seed) {
                foreach ($seed->orders as $seedOrder) {

                    $orderData = [
                        'order_schedule_id' => $schedule->id,
                        'user_id'           => null,
                        'customer_name'     => $seedOrder->customer_name ?: null,
                        'phone_number'      => null,
                        'status'            => 'pending',
                        'is_paying'         => (bool)$seedOrder->is_paying,
                        'already_paid'      => false,
                        'total_price'       => 0,
                    ];

                    if ($orderData['customer_name'] === null) {
                        throw new Exception("Vevő megadása kötelező az alap rendelések generálásakor!");
                    }

                    $existingOrder = Order::where('order_schedule_id', $schedule->id)
                        ->where('customer_name', $orderData['customer_name'])
                        ->first();

                    if ($existingOrder) {
                        throw new Exception("Erre a névre ({$orderData['customer_name']}) már létezik rendelés ezen a napon.");
                    }

                    $order = Order::create($orderData);
                    $orderItems = [];

                    foreach ($seedOrder->products as $product) {
                        $quantityNeeded = $product->pivot->quantity;
                        $unit_price = $product->price;

                        DB::table('order_items')->insert([
                            'order_id'   => $order->id,
                            'product_id' => $product->id,
                            'quantity'   => $quantityNeeded,
                            'unit_price' => $unit_price,
                        ]);

                        $orderItems[] = (object) [
                            'product_id' => $product->id,
                            'quantity'   => $quantityNeeded,
                            'unit_price' => $unit_price,
                            'product'    => $product
                        ];
                    }

                    $total_price = $order->is_paying
                        ? collect($orderItems)->sum(fn($item) => $item->quantity * $item->unit_price)
                        : 0;

                    $order->update(['total_price' => $total_price]);

                    foreach ($orderItems as $orderItem) {
                        $remaining = DB::table('order_schedule_products')
                            ->where('order_schedule_id', $order->order_schedule_id)
                            ->where('product_id', $orderItem->product_id)
                            ->value('remaining_quantity');

                        if ($remaining < $orderItem->quantity) {
                            throw new Exception("Nincs elég szabad termék az alap rendelésekhez: {$orderItem->product->name}");
                        }

                        DB::table('order_schedule_products')
                            ->where('order_schedule_id', $order->order_schedule_id)
                            ->where('product_id', $orderItem->product_id)
                            ->decrement('remaining_quantity', $orderItem->quantity);
                    }
                    $order->load(['orderItems.product', 'orderSchedule', 'user']);
                    OrderController::recalculateRemainingQuantities($order->orderSchedule);

                    try {
                        broadcast(new OrdersChanged($order))->toOthers();
                    } catch (Exception $e) {
                    }
                }
            }
            DB::commit();
            $schedule->load(['products' => function ($query) {
                $query->where('is_used', true);
            }]);

            try {
                broadcast(new OrderSchedulesChanged($schedule))->toOthers();
            } catch (Exception $e) {
            }

            return (new OrderScheduleResource($schedule))
                ->response()
                ->setStatusCode(Response::HTTP_CREATED);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function update(UpdateOrderScheduleRequest $request, $id)
    {
        $authUser = $request->user();
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        try {
            return DB::transaction(function () use ($request, $id) {
                $validated = $request->validated();
                $orderSchedule = OrderSchedule::findOrFail($id);

                if (isset($validated['available_date'])) {
                    $orderSchedule->update(['available_date' => $validated['available_date']]);
                }

                if (isset($validated['note'])) {
                    $orderSchedule->update(['note' => $validated['note']]);
                }

                if (isset($validated['products'])) {
                    foreach ($validated['products'] as $product) {
                        $orderedQuantity = DB::table('orders')
                            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                            ->where('orders.order_schedule_id', $orderSchedule->id)
                            ->where('order_items.product_id', $product['id'])
                            ->sum('order_items.quantity');

                        if ($product['max_quantity'] < $orderedQuantity) {
                            throw new Exception("Maximum mennyiséget nem lehet kisebbre állítani, mint a már leadott rendelések");
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

                $orderSchedule->load(['products' => function ($query) {
                    $query->where('is_used', true);
                }]);

                try {
                    broadcast(new OrderSchedulesChanged($orderSchedule))->toOthers();
                } catch (Exception $e) {
                }

                return new OrderScheduleResource($orderSchedule);
            });
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy($id)
    {
        if (request()->user()->role !== 'admin') {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 401);
        }
        OrderSchedule::destroy($id);
        try {
            broadcast(new OrderSchedulesChanged(null, $id))->toOthers();
        } catch (Exception $e) {
        }
        return response()->noContent();
    }
}
