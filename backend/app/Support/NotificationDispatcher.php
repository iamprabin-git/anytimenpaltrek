<?php

namespace App\Support;

use App\Models\User;
use App\Notifications\PanelNotification;

class NotificationDispatcher
{
    public static function notifyAdmins(
        string $title,
        string $message,
        ?string $href = null,
        string $category = 'system',
        bool $email = true,
    ): void {
        User::query()
            ->where('role', User::ROLE_ADMIN)
            ->where('status', User::STATUS_ACTIVE)
            ->each(function (User $user) use ($title, $message, $href, $category, $email) {
                $user->notify(new PanelNotification($title, $message, $href, $category));

                if ($email) {
                    EmailNotifier::mirrorPanel($user, $title, $message, $href);
                }
            });
    }

    public static function notifyAgentsWithPermission(
        string $permission,
        string $title,
        string $message,
        ?string $href = null,
        string $category = 'system',
        bool $email = true,
    ): void {
        User::query()
            ->where('role', User::ROLE_AGENT)
            ->where('status', User::STATUS_ACTIVE)
            ->get()
            ->filter(fn (User $user) => $user->hasAgentPermission($permission))
            ->each(function (User $user) use ($title, $message, $href, $category, $email) {
                $user->notify(new PanelNotification($title, $message, $href, $category));

                if ($email) {
                    EmailNotifier::mirrorPanel($user, $title, $message, $href);
                }
            });
    }

    public static function notifyUser(
        User $user,
        string $title,
        string $message,
        ?string $href = null,
        string $category = 'system',
        bool $email = true,
    ): void {
        $user->notify(new PanelNotification($title, $message, $href, $category));

        if ($email) {
            EmailNotifier::mirrorPanel($user, $title, $message, $href);
        }
    }
}
