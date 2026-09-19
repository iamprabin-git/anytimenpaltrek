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
        bool $email = false,
    ): void {
        User::query()
            ->where('role', User::ROLE_ADMIN)
            ->where('status', User::STATUS_ACTIVE)
            ->each(fn (User $user) => $user->notify(new PanelNotification($title, $message, $href, $category)));
    }

    public static function notifyAgentsWithPermission(
        string $permission,
        string $title,
        string $message,
        ?string $href = null,
        string $category = 'system',
        bool $email = false,
    ): void {
        User::query()
            ->where('role', User::ROLE_AGENT)
            ->where('status', User::STATUS_ACTIVE)
            ->get()
            ->filter(fn (User $user) => $user->hasAgentPermission($permission))
            ->each(fn (User $user) => $user->notify(new PanelNotification($title, $message, $href, $category)));
    }

    public static function notifyUser(
        User $user,
        string $title,
        string $message,
        ?string $href = null,
        string $category = 'system',
        bool $email = false,
    ): void {
        $user->notify(new PanelNotification($title, $message, $href, $category));
    }
}
