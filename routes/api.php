<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\OrderScheduleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CostController;
use App\Http\Controllers\OrderSeedController;
use App\Http\Controllers\RegistrationRequestController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\UserController;

/* Public endpoints */

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show']);

Route::get('orderSchedules', [OrderScheduleController::class, 'index']);
Route::get('orderSchedules/{orderSchedule}', [OrderScheduleController::class, 'show']);

Route::post('orders', [OrderController::class, 'store']);

/* Authenticated user endpoints */

Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [UserController::class, 'show']);
    Route::put('me', [UserController::class, 'update']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{orderSchedule}', [OrderController::class, 'getOrdersByOrderSchedule']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::put('orders/{order}', [OrderController::class, 'update']);
    Route::delete('orders/{order}', [OrderController::class, 'destroy']);
});

/* Admin-only endpoints */
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('products', [ProductController::class, 'store']);
    Route::put('products/{product}', [ProductController::class, 'update']);
    Route::delete('products/{product}', [ProductController::class, 'destroy']);

    Route::post('orderSchedules', [OrderScheduleController::class, 'store']);
    Route::put('orderSchedules/{orderSchedule}', [OrderScheduleController::class, 'update']);
    Route::delete('orderSchedules/{orderSchedule}', [OrderScheduleController::class, 'destroy']);

    Route::get('seeds', [OrderSeedController::class, 'index']);
    Route::post('seeds', [OrderSeedController::class, 'store']);
    Route::put('seeds/{seed}', [OrderSeedController::class, 'update']);
    Route::delete('seeds/{seed}', [OrderSeedController::class, 'destroy']);

    Route::get('costs', [CostController::class, 'index']);
    Route::post('costs', [CostController::class, 'store']);
    Route::get('costs/{cost}', [CostController::class, 'show']);
    Route::put('costs/{cost}', [CostController::class, 'update']);
    Route::delete('costs/{cost}', [CostController::class, 'destroy']);

    Route::get('statistics/monthly', [StatisticsController::class, 'monthly']);
    Route::get('statistics/yearly', [StatisticsController::class, 'yearly']);

    Route::get('/registration-requests', [RegistrationRequestController::class, 'index']);
    Route::post('/registration-requests/{id}/approve', [RegistrationRequestController::class, 'approve']);
    Route::post('/registration-requests/{id}/reject', [RegistrationRequestController::class, 'reject']);
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('auth')->group(function () {
    Route::post('/fcm-token', [AuthController::class, 'updateFcmToken']);
});
