<?php

namespace App\Mail;

use App\Models\OrderSchedule;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderReminderEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public OrderSchedule $schedule
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Rendelés emlékeztető',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-reminder',
        );
    }
}
