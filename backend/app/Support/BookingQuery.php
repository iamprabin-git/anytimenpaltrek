<?php

namespace App\Support;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class BookingQuery
{
    public static function forAgent(Request $request): Builder
    {
        $query = Booking::query()
            ->with(['package:id,title,slug,category,price,price_label', 'user:id,name,email', 'approver:id,name'])
            ->orderByDesc('created_at');

        self::applyStatusFilter($query, $request->string('status')->toString());
        self::applySearch($query, $request->query('search'));

        return $query;
    }

    public static function applyStatusFilter(Builder $query, string $status): void
    {
        if ($status === '') {
            return;
        }

        match ($status) {
            'pending' => $query->whereIn('status', [Booking::STATUS_PENDING_APPROVAL, Booking::STATUS_PENDING]),
            'confirmed' => $query->whereIn('status', [Booking::STATUS_CONFIRMED, Booking::STATUS_PAID]),
            'rejected' => $query->where('status', Booking::STATUS_REJECTED),
            default => $query->where('status', $status),
        };
    }

    public static function applySearch(Builder $query, mixed $search): void
    {
        $term = trim((string) $search);
        if ($term === '') {
            return;
        }

        $like = '%'.$term.'%';

        $query->where(function (Builder $inner) use ($like) {
            $inner->where('customer_name', 'like', $like)
                ->orWhere('customer_email', 'like', $like)
                ->orWhere('customer_phone', 'like', $like)
                ->orWhere('customer_address', 'like', $like)
                ->orWhere('customer_notes', 'like', $like)
                ->orWhere('review_note', 'like', $like)
                ->orWhereHas('package', fn (Builder $package) => $package
                    ->where('title', 'like', $like)
                    ->orWhere('slug', 'like', $like));
        });
    }
}
