<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function monthly(Request $request)
    {
        $authUser = $request->user();
        if (!$authUser || $authUser->role !== 'admin') {
            return response()->json(['error' => 'Nincs jogod ehhez a művelethez'], 401);
        }

        $month = $request->query('month');
        if (!$month) {
            return response()->json([
                'error' => 'Month parameter is required in the format YYYY-MM.'
            ], 400);
        }

        $sales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('order_schedules', 'orders.order_schedule_id', '=', 'order_schedules.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                DB::raw('SUM(order_items.quantity) as quantity'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as income')
            )
            ->where('orders.status', 'completed')
            ->where('orders.is_paying', true)
            ->whereRaw("strftime('%Y-%m', order_schedules.available_date) = ?", [$month])
            ->groupBy('products.id', 'products.name')
            ->get();

        $costs = DB::table('costs')
            ->select('name', 'amount')
            ->whereRaw("strftime('%Y-%m', month) = ?", [$month])
            ->get();

        return response()->json([
            'sales' => $sales,
            'costs' => $costs
        ]);
    }
}
