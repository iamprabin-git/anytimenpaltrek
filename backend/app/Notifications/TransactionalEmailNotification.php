<?php

namespace App\Notifications;

use App\Support\EmailBranding;
use App\Support\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransactionalEmailNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly EmailTemplate $template,
        private readonly ?string $greetingName = null,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $name = $this->greetingName ?? ($notifiable->name ?? null);
        $details = array_filter($this->template->details, fn ($value) => $value !== null && $value !== '');

        return (new MailMessage)
            ->subject(EmailBranding::subject($this->template->subject))
            ->markdown('mail.transactional', [
                'headline' => $this->template->headline,
                'greeting' => $name ? "Hello {$name}," : null,
                'intro' => $this->template->intro,
                'lines' => $this->template->lines,
                'details' => $details,
                'actionText' => $this->template->actionText,
                'actionUrl' => $this->template->actionUrl,
                'footerNote' => $this->template->footerNote,
                'companyName' => EmailBranding::companyName(),
                'supportEmail' => EmailBranding::supportEmail(),
                'supportPhone' => EmailBranding::supportPhone(),
            ]);
    }
}
