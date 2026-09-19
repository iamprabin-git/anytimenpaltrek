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

    public static function supportEmail(): string
    {
        $email = CompanySetting::current()->email;

        return filled($email) ? (string) $email : 'info@anytimenepaltrek.com';
    }

    public static function supportPhone(): ?string
    {
        $phone = CompanySetting::current()->phone;

        return filled($phone) ? (string) $phone : null;
    }

    public static function formatMoney(float|string|null $amount, ?string $currency = 'USD'): string
    {
        if ($amount === null || $amount === '') {
            return '—';
        }

        $symbol = strtoupper((string) $currency) === 'USD' ? '$' : strtoupper((string) $currency).' ';

        return $symbol.number_format((float) $amount, 2);
    }

    public static function accountUrl(): string
    {
        return self::frontendUrl().'/account';
    }

    public static function bookingsUrl(): string
    {
        return self::frontendUrl().'/account/bookings';
    }
}
