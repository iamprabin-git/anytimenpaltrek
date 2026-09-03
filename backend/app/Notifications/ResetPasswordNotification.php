<?php

namespace App\Notifications;

use App\Support\EmailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $token,
        private readonly string $portal,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = EmailBranding::frontendUrl();
        $path = match ($this->portal) {
            'admin' => '/admin/login/reset-password',
            'agent' => '/agent/login/reset-password',
            default => '/login/reset-password',
        };

        $email = method_exists($notifiable, 'getEmailForPasswordReset')
            ? $notifiable->getEmailForPasswordReset()
            : $notifiable->email;

        $url = $frontendUrl.$path.'?token='.urlencode($this->token).'&email='.urlencode((string) $email);

        return (new MailMessage)
            ->subject(EmailBranding::subject('Reset your password'))
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire in '.config('auth.passwords.users.expire').' minutes.')
            ->line('If you did not request a password reset, no further action is required.')
            ->salutation(EmailBranding::salutation());
    }
}
