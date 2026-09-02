<?php

namespace App\Support;

use App\Models\Booking;

class BookingPresenter
{
    /** @return array<string, mixed> */
    public static function format(Booking $booking, bool $includeProof = true): array
    {
        $data = [
            'id' => $booking->id,
            'customer_name' => $booking->customer_name,
            'customer_email' => $booking->customer_email,
            'customer_phone' => $booking->customer_phone,
            'customer_address' => $booking->customer_address,
            'customer_notes' => $booking->customer_notes,
            'booking_date' => $booking->booking_date?->toDateString(),
            'amount' => $booking->amount,
            'currency' => $booking->currency,
            'payment_method' => $booking->payment_method,
            'status' => $booking->status,
            'review_note' => $booking->review_note,
            'approved_at' => $booking->approved_at,
            'created_at' => $booking->created_at,
            'package' => $booking->relationLoaded('package') && $booking->package ? [
                'id' => $booking->package->id,
                'title' => $booking->package->title,
                'slug' => $booking->package->slug,
                'category' => $booking->package->category,
                'price' => $booking->package->price,
                'price_label' => $booking->package->price_label,
            ] : null,
            'user' => $booking->relationLoaded('user') && $booking->user ? [
                'id' => $booking->user->id,
                'name' => $booking->user->name,
                'email' => $booking->user->email,
            ] : null,
            'approver' => $booking->relationLoaded('approver') && $booking->approver ? [
                'id' => $booking->approver->id,
                'name' => $booking->approver->name,
            ] : null,
        ];

        if ($includeProof) {
            $data['payment_proof_url'] = ImageStorage::url($booking->payment_proof);
        }

        return $data;
    }

    public static function statusLabel(?string $status): string
    {
        return match ($status) {
            Booking::STATUS_PENDING_APPROVAL => 'Pending Approval',
            Booking::STATUS_CONFIRMED => 'Confirmed',
            Booking::STATUS_REJECTED => 'Rejected',
            Booking::STATUS_PAID => 'Paid',
            Booking::STATUS_PENDING => 'Pending',
            default => ucfirst(str_replace('_', ' ', (string) $status)),
        };
    }

    public static function paymentMethodLabel(?string $method): string
    {
        return match ($method) {
            Booking::METHOD_MANUAL => 'Manual Payment',
            Booking::METHOD_COD => 'Cash on Delivery',
            Booking::METHOD_ONLINE => 'Online Payment',
            default => ucfirst(str_replace('_', ' ', (string) $method)),
        };
    }
}
