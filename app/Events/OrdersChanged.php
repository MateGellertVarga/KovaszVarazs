<?php

namespace App\Events;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrdersChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public OrderResource $order;

    public function __construct(Order $order)
    {
        $this->order = new OrderResource($order);
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('orders');
    }

    public function broadcastAs(): string
    {
        return 'orders.changed';
    }
}
