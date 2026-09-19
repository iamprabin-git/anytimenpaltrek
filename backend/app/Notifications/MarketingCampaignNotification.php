<?php

namespace App\Notifications;

use App\Support\EmailBranding;
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

        return (new MailMessage)
            ->subject(EmailBranding::subject($this->subject))
            ->markdown('mail.transactional', [
                'headline' => $this->subject,
                'greeting' => $notifiable->name ? "Hello {$notifiable->name}," : null,
                'intro' => 'We have an update from '.EmailBranding::companyName().' for you.',
                'lines' => $lines,
                'details' => [],
                'actionText' => 'Visit your account',
                'actionUrl' => EmailBranding::accountUrl(),
                'footerNote' => 'Thank you for choosing us for your next adventure.',
                'companyName' => EmailBranding::companyName(),
                'supportEmail' => EmailBranding::supportEmail(),
                'supportPhone' => EmailBranding::supportPhone(),
            ]);
    }
}
