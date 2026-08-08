<?php

use App\Models\User;
use App\Models\OrderSchedule;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderReminderEmail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    $targetDate = Carbon::today()->addDays(2);
    $schedule = OrderSchedule::whereDate('available_date', $targetDate)->first();

    if (!$schedule) {
        return;
    }

    $usersToRemind = User::where('is_active', true)
        ->where('wants_reminder', true)
        ->get();

    foreach ($usersToRemind as $user) {
        $hasOrder = Order::where('order_schedule_id', $schedule->id)
            ->where('user_id', $user->id)
            ->where('status', '!=', 'completed')
            ->exists();

        if (!$hasOrder) {
            Mail::to($user->email)->send(new OrderReminderEmail($user, $schedule));
        }
    }
})->dailyAt('18:00')->timezone('Europe/Budapest');
