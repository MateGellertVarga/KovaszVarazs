<?php

namespace App\Events;

use App\Http\Resources\OrderScheduleResource;
use App\Models\OrderSchedule;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderSchedulesChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ?OrderScheduleResource $orderSchedule = null;
    public ?int $orderScheduleId = null;

    public function __construct(?OrderSchedule $orderSchedule = null, ?int $orderScheduleId = null)
    {
        if ($orderSchedule) {
            $this->orderSchedule = new OrderScheduleResource($orderSchedule);
            $this->orderScheduleId = $orderSchedule->id;
        } elseif ($orderScheduleId) {
            $this->orderScheduleId = $orderScheduleId;
        }
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('order-schedules');
    }

    public function broadcastAs(): string
    {
        return 'order-schedules.changed';
    }
}
