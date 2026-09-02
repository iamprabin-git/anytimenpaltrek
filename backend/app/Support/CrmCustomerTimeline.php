<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\ContactInquiry;
use App\Models\CrmInteraction;
use App\Models\Review;
use App\Models\User;
use App\Models\UserSuggestion;
use App\Models\WishlistItem;
use Illuminate\Support\Collection;

class CrmCustomerTimeline
{
    /** @return array<int, array<string, mixed>> */
    public static function forUser(User $user): array
    {
        $events = collect();

        Booking::query()
            ->with('package:id,title,slug,category')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->each(function (Booking $booking) use ($events) {
                $packageTitle = $booking->package?->title ?? 'Package';
                $events->push([
                    'id' => "booking-{$booking->id}",
                    'type' => 'booking',
                    'title' => "Booking: {$packageTitle}",
                    'description' => trim(($booking->customer_notes ?: '')." Status: {$booking->status}. Amount: {$booking->currency} {$booking->amount}."),
                    'occurred_at' => $booking->created_at?->toIso8601String(),
                    'metadata' => [
                        'booking_id' => $booking->id,
                        'status' => $booking->status,
                        'amount' => $booking->amount,
                        'currency' => $booking->currency,
                    ],
                ]);
            });

        ContactInquiry::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('email', $user->email);
            })
            ->orderByDesc('created_at')
            ->get()
            ->each(function (ContactInquiry $inquiry) use ($events) {
                $events->push([
                    'id' => "inquiry-{$inquiry->id}",
                    'type' => 'inquiry',
                    'title' => $inquiry->subject ?: 'Customer inquiry',
                    'description' => $inquiry->message,
                    'occurred_at' => $inquiry->created_at?->toIso8601String(),
                    'metadata' => [
                        'inquiry_id' => $inquiry->id,
                        'status' => $inquiry->status,
                    ],
                ]);
            });

        Review::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->each(function (Review $review) use ($events) {
                $events->push([
                    'id' => "review-{$review->id}",
                    'type' => 'review',
                    'title' => "Review ({$review->rating}/5)",
                    'description' => $review->content,
                    'occurred_at' => $review->created_at?->toIso8601String(),
                    'metadata' => [
                        'review_id' => $review->id,
                        'status' => $review->status,
                        'rating' => $review->rating,
                    ],
                ]);
            });

        UserSuggestion::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->each(function (UserSuggestion $suggestion) use ($events) {
                $events->push([
                    'id' => "suggestion-{$suggestion->id}",
                    'type' => 'suggestion',
                    'title' => $suggestion->subject ?: 'Customer suggestion',
                    'description' => $suggestion->message,
                    'occurred_at' => $suggestion->created_at?->toIso8601String(),
                    'metadata' => [
                        'suggestion_id' => $suggestion->id,
                        'status' => $suggestion->status,
                    ],
                ]);
            });

        WishlistItem::query()
            ->with('package:id,title,slug,category')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->each(function (WishlistItem $item) use ($events) {
                $packageTitle = $item->package?->title ?? 'Saved package';
                $events->push([
                    'id' => "wishlist-{$item->id}",
                    'type' => 'wishlist',
                    'title' => "Saved: {$packageTitle}",
                    'description' => 'Customer added a package to their wishlist.',
                    'occurred_at' => $item->created_at?->toIso8601String(),
                    'metadata' => [
                        'wishlist_item_id' => $item->id,
                        'package_id' => $item->package_id,
                    ],
                ]);
            });

        CrmInteraction::query()
            ->with('agent:id,name')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->each(function (CrmInteraction $interaction) use ($events) {
                $events->push([
                    'id' => "interaction-{$interaction->id}",
                    'type' => $interaction->type,
                    'title' => $interaction->title,
                    'description' => $interaction->description,
                    'occurred_at' => $interaction->created_at?->toIso8601String(),
                    'metadata' => array_merge($interaction->metadata ?? [], [
                        'interaction_id' => $interaction->id,
                        'agent_name' => $interaction->agent?->name,
                    ]),
                ]);
            });

        return $events
            ->filter(fn (array $event) => ! empty($event['occurred_at']))
            ->sortByDesc('occurred_at')
            ->values()
            ->all();
    }

    public static function interactionCount(User $user): int
    {
        return Booking::where('user_id', $user->id)->count()
            + ContactInquiry::query()
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->orWhere('email', $user->email);
                })
                ->count()
            + Review::where('user_id', $user->id)->count()
            + UserSuggestion::where('user_id', $user->id)->count()
            + WishlistItem::where('user_id', $user->id)->count()
            + CrmInteraction::where('user_id', $user->id)->count();
    }

    /** @return Collection<int, User> */
    public static function recentCustomers(int $limit = 8): Collection
    {
        return User::query()
            ->where('role', User::ROLE_USER)
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get();
    }
}
