<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\Package;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

class PackageAvailability
{
    public const STATUS_PAST = 'past';

    public const STATUS_AVAILABLE = 'available';

    public const STATUS_LIMITED = 'limited';

    public const STATUS_FULL = 'full';

    public static function totalSeats(Package $package): int
    {
        return max(1, (int) ($package->group_size_max ?: 6));
    }

    public static function forMonth(Package $package, int $year, int $month): array
    {
        $start = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $end = $start->copy()->endOfMonth();
        $counts = self::bookingCounts($package, $start, $end);
        $totalSeats = self::totalSeats($package);
        $today = Carbon::today();

        $days = [];

        foreach (CarbonPeriod::create($start, $end) as $date) {
            $days[] = self::dayPayload($package, $date, $counts, $totalSeats, $today);
        }

        return [
            'package' => self::packagePayload($package),
            'month' => $start->format('Y-m'),
            'total_seats' => $totalSeats,
            'days' => $days,
        ];
    }

    public static function forDate(Package $package, string $date): array
    {
        $start = Carbon::parse($date)->startOfDay();
        $counts = self::bookingCounts($package, $start, $start->copy()->endOfDay());
        $totalSeats = self::totalSeats($package);

        return self::dayPayload($package, $start, $counts, $totalSeats, Carbon::today());
    }

    public static function isBookable(Package $package, string $date): bool
    {
        $day = self::forDate($package, $date);

        return in_array($day['status'], [self::STATUS_AVAILABLE, self::STATUS_LIMITED], true);
    }

    private static function bookingCounts(Package $package, Carbon $start, Carbon $end): Collection
    {
        return Booking::query()
            ->where('package_id', $package->id)
            ->whereNotIn('status', [Booking::STATUS_REJECTED])
            ->whereDate('booking_date', '>=', $start->toDateString())
            ->whereDate('booking_date', '<=', $end->toDateString())
            ->selectRaw('DATE(booking_date) as trip_date, COUNT(*) as booked')
            ->groupBy('trip_date')
            ->pluck('booked', 'trip_date');
    }

    private static function dayPayload(
        Package $package,
        Carbon $date,
        Collection $counts,
        int $totalSeats,
        Carbon $today
    ): array {
        $dateString = $date->toDateString();
        $endDate = $date->copy()->addDays(max(0, (int) $package->duration_days - 1));

        if ($date->lt($today)) {
            return [
                'date' => $dateString,
                'end_date' => $endDate->toDateString(),
                'duration_days' => (int) $package->duration_days,
                'booked_seats' => (int) ($counts[$dateString] ?? 0),
                'available_seats' => 0,
                'total_seats' => $totalSeats,
                'status' => self::STATUS_PAST,
            ];
        }

        $booked = (int) ($counts[$dateString] ?? 0);
        $available = max(0, $totalSeats - $booked);
        $status = self::STATUS_FULL;

        if ($available >= 3) {
            $status = self::STATUS_AVAILABLE;
        } elseif ($available > 0) {
            $status = self::STATUS_LIMITED;
        }

        return [
            'date' => $dateString,
            'end_date' => $endDate->toDateString(),
            'duration_days' => (int) $package->duration_days,
            'booked_seats' => $booked,
            'available_seats' => $available,
            'total_seats' => $totalSeats,
            'status' => $status,
        ];
    }

    private static function packagePayload(Package $package): array
    {
        return [
            'id' => $package->id,
            'slug' => $package->slug,
            'title' => $package->title,
            'duration_days' => (int) $package->duration_days,
            'price' => $package->price,
            'price_label' => $package->price_label,
            'group_size_max' => self::totalSeats($package),
        ];
    }
}
