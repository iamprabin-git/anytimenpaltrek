<?php

namespace App\Notifications;

use App\Support\EmailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TransactionalEmailNotification extends Notification
{
    use Queueable;

    /** @param  list<string>  $lines */
    public function __construct(
        private readonly string $subject,
        private readonly array $lines,
        private readonly ?string $actionText = null,
        private readonly ?string $actionUrl = null,
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

        $mail = (new MailMessage)
            ->subject(EmailBranding::subject($this->subject));

        if ($name) {
            $mail->greeting("Hello {$name}!");
        }

        foreach ($this->lines as $line) {
            if ($line !== '') {
                $mail->line($line);
            }
        }

        if ($this->actionText && $this->actionUrl) {
            $mail->action($this->actionText, $this->actionUrl);
        }

        return $mail->salutation(EmailBranding::salutation());
    }
}
