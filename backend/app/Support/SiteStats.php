<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\CompanySetting;
use App\Models\Destination;
use App\Models\Package;
use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;

class SiteStats
{
    public static function forPublic(): array
    {
        return [
            'reviews_count' => self::reviewsCount(),
            'happy_travellers' => self::happyTravellers(),
            'packages_count' => self::activePackagesCount(),
            'destinations_count' => self::destinationsCount(),
            'years_experience' => self::yearsExperience(),
        ];
    }

    public static function reviewsCount(): int
    {
        return Review::approved()->count();
    }

    public static function happyTravellers(): int
    {
        return Booking::query()
            ->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_PAID])
            ->count();
    }

    public static function activePackagesCount(): int
    {
        return Package::active()->count();
    }

    public static function destinationsCount(): int
    {
        return Destination::query()->count();
    }

    public static function yearsExperience(): int
    {
        $candidates = array_filter([
            Package::query()->min('created_at'),
            Booking::query()->min('created_at'),
            Review::query()->min('created_at'),
            User::query()->where('role', User::ROLE_USER)->min('created_at'),
            CompanySetting::current()->created_at?->toDateTimeString(),
        ]);

        if ($candidates === []) {
            return 1;
        }

        $oldest = min($candidates);

        return max(1, (int) Carbon::parse($oldest)->diffInYears(now()));
    }

    public static function placeholders(): array
    {
        $stats = self::forPublic();

        return [
            '{reviews_count}' => (string) $stats['reviews_count'],
            '{happy_travellers}' => (string) $stats['happy_travellers'],
            '{packages_count}' => (string) $stats['packages_count'],
            '{destinations_count}' => (string) $stats['destinations_count'],
            '{years_experience}' => (string) $stats['years_experience'],
        ];
    }

    public static function interpolate(mixed $value): mixed
    {
        if (is_string($value)) {
            return strtr($value, self::placeholders());
        }

        if (! is_array($value)) {
            return $value;
        }

        foreach ($value as $key => $item) {
            $value[$key] = self::interpolate($item);
        }

        return $value;
    }
}
