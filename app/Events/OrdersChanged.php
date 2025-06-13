<?php

namespace App\Events;

use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
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

    public function broadcastOn(): Channel
    {
        return new Channel('orders');
    }

    public function broadcastWith(): OrderResource
    {
        return $this->order;
    }

    public function broadcastAs(): string
    {
        return 'orders.changed';
    }
}
