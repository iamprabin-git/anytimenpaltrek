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
        $portalLabel = ucfirst($this->portal === 'user' ? 'Customer' : $this->portal);

        return (new MailMessage)
            ->subject(EmailBranding::subject('Reset your password'))
            ->markdown('mail.transactional', [
                'headline' => 'Reset your password',
                'greeting' => $notifiable->name ? "Hello {$notifiable->name}," : null,
                'intro' => 'We received a request to reset the password for your account.',
                'lines' => [
                    'Click the button below to choose a new password. This link is valid for a limited time.',
                    'If you did not request a password reset, you can safely ignore this email.',
                ],
                'details' => [
                    'Account' => (string) $email,
                    'Portal' => $portalLabel,
                    'Expires in' => config('auth.passwords.users.expire').' minutes',
                ],
                'actionText' => 'Reset password',
                'actionUrl' => $url,
                'footerNote' => null,
                'companyName' => EmailBranding::companyName(),
                'supportEmail' => EmailBranding::supportEmail(),
                'supportPhone' => EmailBranding::supportPhone(),
            ]);
    }
}
