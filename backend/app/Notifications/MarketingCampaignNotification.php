<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MarketingCampaignNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $subject,
        private readonly string $message,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $lines = preg_split("/\r\n|\r|\n/", trim($this->message)) ?: [];

        $mail = (new MailMessage)
            ->subject($this->subject);

        foreach ($lines as $line) {
            $mail->line($line);
        }

        return $mail->line('Thank you for choosing us for your next adventure.');
    }
}
