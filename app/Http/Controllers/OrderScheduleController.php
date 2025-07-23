<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderSchedule;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\StoreOrderScheduleRequest;
use App\Http\Requests\UpdateOrderScheduleRequest;
use App\Http\Resources\OrderScheduleResource;
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

        $schedule->load(['products' => function ($query) {
            $query->where('is_used', true);
        }]);

        return (new OrderScheduleResource($schedule))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
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
        return response()->noContent();
    }
}
