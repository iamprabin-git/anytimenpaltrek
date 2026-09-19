<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\CompanySetting;

class BookingEmailDetails
{
    /** @return array<string, string|null> */
    public static function summary(Booking $booking, ?string $statusOverride = null): array
    {
        return array_filter([
            'Reference' => self::reference($booking),
            'Package' => $booking->package?->title,
            'Travel date' => $booking->booking_date?->format('F j, Y'),
            'Amount' => EmailBranding::formatMoney($booking->amount, $booking->currency),
            'Payment method' => BookingPresenter::paymentMethodLabel($booking->payment_method),
            'Status' => $statusOverride ?? BookingPresenter::statusLabel($booking->status),
            'Customer' => $booking->customer_name,
            'Email' => $booking->customer_email,
            'Phone' => $booking->customer_phone,
        ], fn ($value) => filled($value));
    }

    public static function reference(Booking $booking): string
    {
        return '#'.str_pad((string) $booking->id, 6, '0', STR_PAD_LEFT);
    }
}
