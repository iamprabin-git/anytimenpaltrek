<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\ContactInquiry;
use App\Models\Review;
use App\Models\User;
use App\Models\WishlistItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AgentAnalyticsService
{
    public static function build(int $days = 30): array
    {
        $days = max(7, min($days, 365));
        $periodStart = now()->subDays($days)->startOfDay();
        $previousStart = now()->subDays($days * 2)->startOfDay();
        $previousEnd = $periodStart->copy()->subSecond();

        $paidBookingsQuery = Booking::query()->where('status', Booking::STATUS_PAID);
        $allBookingsQuery = Booking::query();

        $totalRevenue = (float) $paidBookingsQuery->sum('amount');
        $periodRevenue = (float) (clone $paidBookingsQuery)
            ->where('created_at', '>=', $periodStart)
            ->sum('amount');
        $previousRevenue = (float) Booking::query()
            ->where('status', Booking::STATUS_PAID)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->sum('amount');

        $paidCount = (clone $paidBookingsQuery)->count();
        $periodPaidCount = (clone $paidBookingsQuery)->where('created_at', '>=', $periodStart)->count();
        $periodBookings = (clone $allBookingsQuery)->where('created_at', '>=', $periodStart)->count();
        $totalBookings = (clone $allBookingsQuery)->count();
        $pendingBookings = Booking::whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_PENDING_APPROVAL])->count();

        $periodInquiries = ContactInquiry::where('created_at', '>=', $periodStart)->count();
        $totalInquiries = ContactInquiry::count();
        $periodReviews = Review::where('created_at', '>=', $periodStart)->count();
        $periodWishlist = WishlistItem::where('created_at', '>=', $periodStart)->count();
        $newCustomers = User::where('role', User::ROLE_USER)->where('created_at', '>=', $periodStart)->count();
        $totalCustomers = User::where('role', User::ROLE_USER)->count();
        $activeCustomers = User::where('role', User::ROLE_USER)->where('status', User::STATUS_ACTIVE)->count();
        $customersWithBookings = User::where('role', User::ROLE_USER)->whereHas('bookings')->count();

        $averageOrderValue = $paidCount > 0 ? round($totalRevenue / $paidCount, 2) : 0.0;
        $revenueGrowth = self::growthPercent($previousRevenue, $periodRevenue);

        return [
            'period_days' => $days,
            'sales' => [
                'total_revenue' => $totalRevenue,
                'period_revenue' => $periodRevenue,
                'previous_period_revenue' => $previousRevenue,
                'revenue_growth_percent' => $revenueGrowth,
                'paid_bookings' => $paidCount,
                'period_paid_bookings' => $periodPaidCount,
                'period_booking_requests' => $periodBookings,
                'pending_bookings' => $pendingBookings,
                'average_order_value' => $averageOrderValue,
            ],
            'user_behavior' => [
                'total_customers' => $totalCustomers,
                'active_customers' => $activeCustomers,
                'new_customers' => $newCustomers,
                'period_inquiries' => $periodInquiries,
                'total_inquiries' => $totalInquiries,
                'period_reviews' => $periodReviews,
                'period_wishlist_saves' => $periodWishlist,
                'registrations_by_source' => self::registrationsBySource($periodStart),
            ],
            'conversion' => [
                'inquiry_to_booking_rate' => self::rate($periodBookings, $periodInquiries),
                'registration_to_booking_rate' => self::rate($customersWithBookings, $totalCustomers),
                'booking_to_paid_rate' => self::rate($paidCount, max($totalBookings, 1)),
                'period_booking_to_paid_rate' => self::rate($periodPaidCount, max($periodBookings, 1)),
            ],
            'revenue_trend' => self::revenueTrend(6),
            'top_packages' => self::topPackagesByRevenue(5),
            'payment_methods' => self::revenueByPaymentMethod(),
            'booking_status_breakdown' => self::bookingStatusBreakdown(),
        ];
    }

    private static function growthPercent(float $previous, float $current): ?float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private static function rate(int $numerator, int $denominator): float
    {
        if ($denominator <= 0) {
            return 0.0;
        }

        return round(($numerator / $denominator) * 100, 1);
    }

    /** @return array<int, array{source: string, count: int}> */
    private static function registrationsBySource(Carbon $periodStart): array
    {
        return User::query()
            ->select('registration_source', DB::raw('COUNT(*) as count'))
            ->where('role', User::ROLE_USER)
            ->where('created_at', '>=', $periodStart)
            ->groupBy('registration_source')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'source' => $row->registration_source ?: 'unknown',
                'count' => (int) $row->count,
            ])
            ->all();
    }

    /** @return array<int, array{label: string, revenue: float, bookings: int}> */
    private static function revenueTrend(int $months): array
    {
        $start = now()->subMonths($months - 1)->startOfMonth();
        $paidStatus = Booking::STATUS_PAID;
        $rows = Booking::query()
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month_key")
            ->selectRaw("SUM(CASE WHEN status = '{$paidStatus}' THEN amount ELSE 0 END) as revenue")
            ->selectRaw("SUM(CASE WHEN status = '{$paidStatus}' THEN 1 ELSE 0 END) as paid_bookings")
            ->where('created_at', '>=', $start)
            ->groupBy('month_key')
            ->orderBy('month_key')
            ->get()
            ->keyBy('month_key');

        $trend = [];
        for ($i = 0; $i < $months; $i++) {
            $month = $start->copy()->addMonths($i);
            $key = $month->format('Y-m');
            $row = $rows->get($key);

            $trend[] = [
                'label' => $month->format('M Y'),
                'revenue' => round((float) ($row->revenue ?? 0), 2),
                'bookings' => (int) ($row->paid_bookings ?? 0),
            ];
        }

        return $trend;
    }

    /** @return array<int, array{package_id: int|null, title: string, revenue: float, bookings: int}> */
    private static function topPackagesByRevenue(int $limit): array
    {
        $rows = Booking::query()
            ->select('package_id', DB::raw('SUM(amount) as revenue'), DB::raw('COUNT(*) as bookings'))
            ->where('status', Booking::STATUS_PAID)
            ->whereNotNull('package_id')
            ->groupBy('package_id')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        $packageIds = $rows->pluck('package_id')->filter()->all();
        $titles = \App\Models\Package::query()
            ->whereIn('id', $packageIds)
            ->pluck('title', 'id');

        return $rows->map(fn ($row) => [
            'package_id' => $row->package_id,
            'title' => $titles[$row->package_id] ?? 'Unknown package',
            'revenue' => round((float) $row->revenue, 2),
            'bookings' => (int) $row->bookings,
        ])->all();
    }

    /** @return array<int, array{method: string, revenue: float, bookings: int}> */
    private static function revenueByPaymentMethod(): array
    {
        return Booking::query()
            ->select('payment_method', DB::raw('SUM(amount) as revenue'), DB::raw('COUNT(*) as bookings'))
            ->where('status', Booking::STATUS_PAID)
            ->groupBy('payment_method')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->payment_method ?: 'unknown',
                'revenue' => round((float) $row->revenue, 2),
                'bookings' => (int) $row->bookings,
            ])
            ->all();
    }

    /** @return array<int, array{status: string, count: int}> */
    private static function bookingStatusBreakdown(): array
    {
        return Booking::query()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status,
                'count' => (int) $row->count,
            ])
            ->all();
    }
}
