<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderSeedRequest;
use App\Http\Requests\UpdateOrderSeedRequest;
use App\Http\Resources\OrderSeedResource;
use App\Models\OrderSeed;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderSeedController extends Controller
{
    public function index()
    {
        $seeds = OrderSeed::with('orders.products')->get();
        return OrderSeedResource::collection($seeds);
    }

    public function store(StoreOrderSeedRequest $request)
    {
        DB::beginTransaction();
        try {
            $orderSeed = OrderSeed::create(['day' => $request->day]);

            foreach ($request->orders as $orderData) {
                $seedOrder = $orderSeed->orders()->create([
                    'customer_name' => $orderData['customer_name'],
                    'is_paying' => $orderData['is_paying'] ?? true
                ]);

                $attachData = [];
                foreach ($orderData['order_items'] as $itemData) {
                    $attachData[$itemData['product_id']] = [
                        'product_name' => $itemData['product_name'],
                        'quantity' => $itemData['quantity']
                    ];
                }

                $seedOrder->products()->attach($attachData);
            }
            DB::commit();
            return new OrderSeedResource($orderSeed->load('orders.products'));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Sikertelen mentés: ' . $e->getMessage()], 500);
        }
    }

    public function update(UpdateOrderSeedRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $orderSeed = OrderSeed::findOrFail($id);
            $orderSeed->update(['day' => $request->day]);
            $orderSeed->orders()->delete();

            foreach ($request->orders as $orderData) {
                $seedOrder = $orderSeed->orders()->create([
                    'customer_name' => $orderData['customer_name'],
                    'is_paying' => $orderData['is_paying'] ?? true
                ]);

                $attachData = [];
                foreach ($orderData['order_items'] as $itemData) {
                    $attachData[$itemData['product_id']] = [
                        'product_name' => $itemData['product_name'],
                        'quantity' => $itemData['quantity']
                    ];
                }

                $seedOrder->products()->attach($attachData);
            }

            DB::commit();

            return new OrderSeedResource($orderSeed->load('orders.products'));
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Sikertelen módosítás: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $orderSeed = OrderSeed::findOrFail($id);
        return new OrderSeedResource($orderSeed->load('orders.products'));
    }

    public function destroy($id)
    {
        $orderSeed = OrderSeed::findOrFail($id);
        $orderSeed->delete();

        return response()->json(['message' => 'Sikeresen törölve!'], 204);
    }
}
