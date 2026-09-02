<?php

namespace App\Support;

use App\Models\User;

class WhatsappMarketing
{
    public static function resolveNumber(User $user): ?string
    {
        $number = $user->whatsapp_number ?: $user->phone;

        if (! filled($number)) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', (string) $number);

        return $digits !== '' ? $digits : null;
    }

    public static function buildUrl(User $user, string $message): ?string
    {
        $digits = self::resolveNumber($user);

        if (! $digits) {
            return null;
        }

        return 'https://wa.me/'.$digits.'?text='.rawurlencode($message);
    }
}
