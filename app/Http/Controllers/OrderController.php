<?php

namespace App\Http\Controllers;

use App\Events\OrdersChanged;
use App\Events\OrderSchedulesChanged;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderSchedule;
use App\Models\Product;
use App\Models\User;
use App\Services\FcmService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    private function canModifyOrder(User $user, OrderSchedule $schedule): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        $deadline = Carbon::parse($schedule->available_date)->subDay()->setTime(6, 0, 0);
        return Carbon::now()->lessThanOrEqualTo($deadline);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            $orders = Order::with(['orderItems.product', 'orderSchedule', 'user'])->get();
        } else {
            $orders = Order::with(['orderItems.product', 'orderSchedule', 'user'])
                ->where('user_id', $user->id)
                ->where('status', '!=', 'completed')
                ->whereHas('orderSchedule', function ($query) {
                    $query->whereDate('available_date', '>=', Carbon::today());
                })
                ->get();
        }
        return OrderResource::collection($orders);
    }

    public function getOrdersByOrderSchedule(Request $request, OrderSchedule $orderSchedule)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            $orders = Order::with(['orderItems.product', 'orderSchedule', 'user'])
                ->where('order_schedule_id', $orderSchedule->id)->get();
        } else {
            $orders = Order::with(['orderItems.product', 'orderSchedule', 'user'])
                ->where('user_id', $user->id)
                ->where('order_schedule_id', $orderSchedule->id)
                ->get();
        }
        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request)
    {
        $orderSchedule = OrderSchedule::find($request->order_schedule_id);
        if (!$orderSchedule) {
            return response()->json(['message' => 'Nem található a sütési időpont'], 400);
        }

        if (!$this->canModifyOrder($request->user(), $orderSchedule)) {
            return response()->json([
                'message' => 'A rendelés leadási határideje (sütés előtti nap 6:00) már lejárt!'
            ], 403);
        }

        $data = $request->validated();

        if ($request->user()) {
            $data['user_id'] = $request->user()->id;
            $data['customer_name'] = $data['customer_name'] ?? null;
            $data['phone_number'] = $data['phone_number'] ?? null;
        }

        if (($data['user_id'] ?? null) === null && ($data['customer_name'] ?? null) === null) {
            return response()->json(['message' => 'Vevő megadása kötelező'], 400);
        }

        $existingOrder = Order::where('order_schedule_id', $data['order_schedule_id'])
            ->when($data['user_id'] ?? null, fn($query) => $query->where('user_id', $data['user_id']))
            ->when(($data['user_id'] ?? null) === null && ($data['customer_name'] ?? null), fn($query) => $query->where('customer_name', $data['customer_name']))
            ->first();

        if ($existingOrder) {
            return response()->json([
                'message' => 'Erre a névre már létezik rendelés ezen a napon.'
            ], 400);
        }

        try {
            return DB::transaction(function () use ($data, $request, $orderSchedule) {
                $order = Order::create($data);

                $orderItems = [];
                foreach ($request->order_items as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    $unit_price = $product->price;

                    DB::table('order_items')->insert([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $unit_price,
                    ]);

                    $orderItems[] = (object) [
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $unit_price,
                        'product' => $product
                    ];
                }

                $total_price = $order->is_paying
                    ? collect($orderItems)->sum(fn($item) => $item->quantity * $item->unit_price)
                    : 0;
                $order->update(['total_price' => $total_price]);

                foreach ($orderItems as $orderItem) {
                    $affected = DB::table('order_schedule_products')
                        ->where('order_schedule_id', $order->order_schedule_id)
                        ->where('product_id', $orderItem->product_id)
                        ->where('remaining_quantity', '>=', $orderItem->quantity)
                        ->decrement('remaining_quantity', $orderItem->quantity);

                    if ($affected === 0) {
                        throw new Exception("Nincs elég szabad készlet a következő termékből: {$orderItem->product->name}");
                    }

                    $remaining = DB::table('order_schedule_products')
                        ->where('order_schedule_id', $order->order_schedule_id)
                        ->where('product_id', $orderItem->product_id)
                        ->value('remaining_quantity');

                    if ($remaining === 0) {
                        $admin = User::where('id', $orderSchedule->user_id)
                            ->whereNotNull('fcm_token')
                            ->first();

                        if ($admin) {
                            try {
                                $dateFormatted = Carbon::parse($orderSchedule->available_date)
                                    ->locale('hu')
                                    ->isoFormat('YYYY-MM-DD dddd');

                                FcmService::sendPushNotification(
                                    $admin->fcm_token,
                                    'Vigyázat! 🚨',
                                    "{$dateFormatted} napon {$orderItem->product->name} termék elfogyott!",
                                    [
                                        'product_id' => $orderItem->product_id,
                                        'schedule_id' => $order->order_schedule_id
                                    ]
                                );
                            } catch (Exception $e) {
                                Log::error('Push error on store: ' . $e->getMessage());
                            }
                        }
                    }
                }

                $order->load(['orderItems.product', 'orderSchedule', 'user']);
                $this->recalculateRemainingQuantities($order->orderSchedule);
                $order->orderSchedule->refresh();

                try {
                    broadcast(new OrdersChanged($order))->toOthers();
                    broadcast(new OrderSchedulesChanged($order->orderSchedule))->toOthers();
                } catch (Exception $e) {
                    Log::error('Broadcast error on store: ' . $e->getMessage());
                }

                return new OrderResource($order);
            });
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function show(Request $request, $id)
    {
        $order = Order::with(['orderItems.product', 'orderSchedule', 'user'])->findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'admin') {
            if ($order->user_id !== $user->id) {
                return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
            }

            if (Carbon::parse($order->orderSchedule->available_date)->startOfDay()->lessThan(Carbon::today())) {
                return response()->json(['message' => 'Ez a rendelés már lezárult, nem megtekinthető.'], 403);
            }
        }

        return new OrderResource($order);
    }

    public function update(UpdateOrderRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        $authUser = $request->user();

        if ($authUser->role !== 'admin' && $order->user_id !== $authUser->id) {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }

        if (!$this->canModifyOrder($authUser, $order->orderSchedule)) {
            return response()->json([
                'message' => 'A módosítási határidő (sütés előtti nap 6:00) már lejárt!'
            ], 403);
        }

        try {
            return DB::transaction(function () use ($request, $order) {
                $oldOrderItems = $order->orderItems()->get();
                $orderItemsData = collect($request->order_items ?? []);
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
                            $unit_price = $product->price;

                            $affected = DB::table('order_schedule_products')
                                ->where('order_schedule_id', $order->order_schedule_id)
                                ->where('product_id', $item['product_id'])
                                ->where('remaining_quantity', '>=', $item['quantity'])
                                ->decrement('remaining_quantity', $item['quantity']);

                            if ($affected === 0) {
                                throw new Exception("Nincs elég szabad készlet a módosításhoz: {$product->name}");
                            }

                            DB::table('order_items')->insert([
                                'order_id' => $order->id,
                                'product_id' => $item['product_id'],
                                'quantity' => $item['quantity'],
                                'unit_price' => $unit_price,
                            ]);
                        }
                    }
                }

                $total_price = $order->is_paying
                    ? DB::table('order_items')
                    ->where('order_id', $order->id)
                    ->sum(DB::raw('quantity * unit_price'))
                    : 0;

                $order->update(['total_price' => $total_price]);

                $order->load(['orderItems.product', 'orderSchedule', 'user']);
                self::recalculateRemainingQuantities($order->orderSchedule);
                $order->orderSchedule->refresh();

                if ($request->has('order_items')) {
                    foreach ($orderItemsData as $item) {
                        if ($item['quantity'] > 0) {
                            $currentRemaining = DB::table('order_schedule_products')
                                ->where('order_schedule_id', $order->order_schedule_id)
                                ->where('product_id', $item['product_id'])
                                ->value('remaining_quantity');

                            $oldQty = $oldOrderItems->firstWhere('product_id', $item['product_id'])->quantity ?? 0;

                            if ($currentRemaining === 0 && $item['quantity'] > $oldQty) {
                                $product = Product::find($item['product_id']);
                                $admin = User::where('id', $order->orderSchedule->user_id)
                                    ->whereNotNull('fcm_token')
                                    ->first();

                                if ($admin) {
                                    try {
                                        $dateFormatted = Carbon::parse($order->orderSchedule->available_date)
                                            ->locale('hu')
                                            ->isoFormat('YYYY-MM-DD dddd');

                                        FcmService::sendPushNotification(
                                            $admin->fcm_token,
                                            'Vigyázat! 🚨',
                                            "{$dateFormatted} napon {$product->name} termék elfogyott!",
                                            [
                                                'product_id' => $product->id,
                                                'schedule_id' => $order->order_schedule_id
                                            ]
                                        );
                                    } catch (Exception $e) {
                                        Log::error('Push error on update: ' . $e->getMessage());
                                    }
                                }
                            }
                        }
                    }
                }

                try {
                    broadcast(new OrdersChanged($order))->toOthers();
                    broadcast(new OrderSchedulesChanged($order->orderSchedule))->toOthers();
                } catch (Exception $e) {
                    Log::error('Broadcast error on update: ' . $e->getMessage());
                }

                return new OrderResource($order);
            });
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $authUser = $request->user();

        if ($authUser->role !== 'admin' && $order->user_id !== $authUser->id) {
            return response()->json(['message' => 'Nincs jogod ehhez a művelethez'], 403);
        }

        if (!$this->canModifyOrder($authUser, $order->orderSchedule)) {
            return response()->json([
                'message' => 'A rendelés törlési határideje (sütés előtti nap 6:00) már lejárt!'
            ], 403);
        }

        foreach ($order->orderItems as $orderItem) {
            DB::table('order_schedule_products')
                ->where('order_schedule_id', $order->order_schedule_id)
                ->where('product_id', $orderItem->product_id)
                ->increment('remaining_quantity', $orderItem->quantity);
        }

        $order->delete();
        try {
            broadcast(new OrdersChanged($order))->toOthers();
            broadcast(new OrderSchedulesChanged($order->orderSchedule))->toOthers();
        } catch (Exception $e) {
            Log::error('Broadcast error on delete: ' . $e->getMessage());
        }
        return response()->noContent();
    }

    public static function recalculateRemainingQuantities(OrderSchedule $orderSchedule)
    {
        $productIds = $orderSchedule->products()->pluck('products.id');

        foreach ($productIds as $productId) {
            $max = DB::table('order_schedule_products')
                ->where('order_schedule_id', $orderSchedule->id)
                ->where('product_id', $productId)
                ->value('max_quantity');

            $ordered = DB::table('orders')
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->where('orders.order_schedule_id', $orderSchedule->id)
                ->where('order_items.product_id', $productId)
                ->sum('order_items.quantity');

            DB::table('order_schedule_products')
                ->where('order_schedule_id', $orderSchedule->id)
                ->where('product_id', $productId)
                ->update(['remaining_quantity' => $max - $ordered]);
        }
    }
}
