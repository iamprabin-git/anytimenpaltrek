<?php

namespace App\Support;

use App\Models\CompanySetting;

class EmailBranding
{
    public static function companyName(): string
    {
        return CompanySetting::current()->company_name ?: (string) config('app.name', 'Anytime Nepal Trek');
    }

    public static function subject(string $text): string
    {
        return $text.' — '.self::companyName();
    }

    public static function salutation(): string
    {
        return 'Regards,'.PHP_EOL.self::companyName();
    }

    public static function frontendUrl(): string
    {
        return rtrim((string) config('services.frontend.url', 'http://localhost:3000'), '/');
    }

    public static function loginUrl(string $portal = 'user'): string
    {
        return match ($portal) {
            'admin' => self::frontendUrl().'/admin/login',
            'agent' => self::frontendUrl().'/agent/login',
            default => self::frontendUrl().'/login',
        };
    }

    public static function panelUrl(?string $href): ?string
    {
        if (! $href) {
            return null;
        }

        return str_starts_with($href, 'http') ? $href : self::frontendUrl().$href;
    }
}
