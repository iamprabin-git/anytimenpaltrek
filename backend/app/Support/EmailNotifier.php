<?php

namespace App\Support;

use App\Models\User;
use App\Notifications\TransactionalEmailNotification;
use Illuminate\Support\Facades\Notification;

class EmailNotifier
{
    /** @param  list<string>  $lines */
    public static function toUser(
        User $user,
        string $subject,
        array $lines,
        ?string $actionText = null,
        ?string $actionUrl = null,
    ): void {
        if (! $user->email) {
            return;
        }

        $user->notify(new TransactionalEmailNotification(
            $subject,
            $lines,
            $actionText,
            $actionUrl,
            $user->name,
        ));
    }

    /** @param  list<string>  $lines */
    public static function toAddress(
        string $email,
        string $name,
        string $subject,
        array $lines,
        ?string $actionText = null,
        ?string $actionUrl = null,
    ): void {
        Notification::route('mail', [$email => $name])
            ->notify(new TransactionalEmailNotification(
                $subject,
                $lines,
                $actionText,
                $actionUrl,
                $name,
            ));
    }

    public static function mirrorPanel(User $user, string $title, string $message, ?string $href = null): void
    {
        self::toUser(
            $user,
            $title,
            [$message],
            $href ? 'View details' : null,
            EmailBranding::panelUrl($href),
        );
    }

    public static function registrationPending(User $user): void
    {
        self::toUser($user, 'Registration received', [
            'Thank you for registering with us.',
            'Your account is pending approval by our team. We will email you once your account is active.',
            'After approval you can sign in to book treks, tours, and manage your trips.',
        ], 'Visit our website', EmailBranding::frontendUrl());
    }

    public static function agentWelcome(User $agent): void
    {
        self::toUser($agent, 'Welcome to the agent portal', [
            'An administrator has created your agent account.',
            'Sign in with the email address and password provided to you by your administrator.',
            'From the agent portal you can manage bookings, customers, packages, CRM, and more.',
        ], 'Go to agent login', EmailBranding::loginUrl('agent'));
    }

    public static function customerWelcome(User $customer): void
    {
        $isActive = $customer->isActive();

        self::toUser(
            $customer,
            'Welcome to '.EmailBranding::companyName(),
            $isActive
                ? [
                    'Your customer account has been created.',
                    'You can sign in to browse packages, make bookings, and manage your profile.',
                ]
                : [
                    'Your customer account has been created and is pending approval.',
                    'We will email you when your account is ready to use.',
                ],
            $isActive ? 'Sign in' : null,
            $isActive ? EmailBranding::loginUrl('user') : null,
        );
    }

    public static function accountRejected(User $user): void
    {
        self::toUser($user, 'Registration update', [
            'Unfortunately your account registration could not be approved at this time.',
            'If you believe this is a mistake, please contact our support team.',
        ]);
    }

    public static function passwordResetSuccess(User $user, string $portal = 'user'): void
    {
        self::toUser($user, 'Password changed successfully', [
            'Your password was reset successfully.',
            'If you did not make this change, please contact us immediately.',
        ], 'Sign in', EmailBranding::loginUrl($portal));
    }

    public static function contactConfirmation(string $email, string $name, ?string $subject): void
    {
        $subjectLine = $subject ? " about \"{$subject}\"" : '';

        self::toAddress($email, $name, 'We received your message', [
            'Thank you for contacting '.EmailBranding::companyName().'.',
            "We have received your inquiry{$subjectLine} and will get back to you shortly.",
        ]);
    }
}
