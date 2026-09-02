<?php

namespace App\Support;

use App\Models\Booking;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookingExporter
{
    /** @param  iterable<int, Booking>  $bookings */
    public static function exportSpreadsheet(iterable $bookings, string $filename = 'bookings.csv'): StreamedResponse
    {
        return response()->streamDownload(function () use ($bookings) {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'S.N.',
                'Reference',
                'Submitted At',
                'Trip Date',
                'Package',
                'Category',
                'Customer Name',
                'Customer Email',
                'Customer Phone',
                'Customer Address',
                'Customer Notes',
                'Payment Method',
                'Amount',
                'Currency',
                'Status',
                'Approved By',
                'Approved At',
                'Manager Note',
                'Payment Proof URL',
                'Account User',
            ]);

            $serial = 1;

            foreach ($bookings as $booking) {
                fputcsv($handle, [
                    $serial,
                    '#'.$booking->id,
                    optional($booking->created_at)?->toDateTimeString(),
                    $booking->booking_date?->toDateString(),
                    $booking->package?->title,
                    $booking->package?->category,
                    $booking->customer_name,
                    $booking->customer_email,
                    $booking->customer_phone,
                    $booking->customer_address,
                    $booking->customer_notes,
                    BookingPresenter::paymentMethodLabel($booking->payment_method),
                    $booking->amount,
                    strtoupper((string) $booking->currency),
                    BookingPresenter::statusLabel($booking->status),
                    $booking->approver?->name,
                    optional($booking->approved_at)?->toDateTimeString(),
                    $booking->review_note,
                    ImageStorage::url($booking->payment_proof),
                    $booking->user?->email,
                ]);

                $serial++;
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
