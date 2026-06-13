<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('orders', function ($user) {
    return isset($user->role) && $user->role === 'admin';
});

Broadcast::channel('order-schedules', function ($user) {
    return isset($user->id);
});
