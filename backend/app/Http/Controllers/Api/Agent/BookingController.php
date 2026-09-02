<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Support\BookingExporter;
use App\Support\BookingPresenter;
use App\Support\BookingQuery;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = BookingQuery::forAgent($request)
            ->get()
            ->map(fn (Booking $booking) => BookingPresenter::format($booking));

        return response()->json($bookings);
    }

    public function export(Request $request): StreamedResponse
    {
        $bookings = BookingQuery::forAgent($request)->get();

        $status = $request->string('status')->toString();
        $suffix = $status !== '' ? "-{$status}" : '';
        $filename = 'bookings'.$suffix.'-'.now()->format('Y-m-d').'.csv';

        return BookingExporter::exportSpreadsheet($bookings, $filename);
    }

    public function approve(Request $request, Booking $booking): JsonResponse
    {
        if (! $booking->isPendingApproval()) {
            return response()->json(['message' => 'Only pending bookings can be approved.'], 422);
        }

        $validated = $request->validate([
            'review_note' => 'nullable|string|max:1000',
        ]);

        $booking->update([
            'status' => Booking::STATUS_CONFIRMED,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'review_note' => $validated['review_note'] ?? null,
        ]);

        $booking->load(['package:id,title,slug,category', 'user:id,name,email', 'approver:id,name']);

        if ($booking->user) {
            NotificationDispatcher::notifyUser(
                $booking->user,
                'Booking confirmed',
                'Your booking for '.($booking->package?->title ?? 'your trip').' has been approved by our team.',
                '/account/bookings',
                'booking'
            );
        }

        return response()->json([
            'message' => 'Booking approved successfully.',
            'booking' => BookingPresenter::format($booking),
        ]);
    }

    public function reject(Request $request, Booking $booking): JsonResponse
    {
        if (! $booking->isPendingApproval()) {
            return response()->json(['message' => 'Only pending bookings can be rejected.'], 422);
        }

        $validated = $request->validate([
            'review_note' => 'nullable|string|max:1000',
        ]);

        $booking->update([
            'status' => Booking::STATUS_REJECTED,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'review_note' => $validated['review_note'] ?? null,
        ]);

        $booking->load(['package:id,title,slug,category', 'user:id,name,email', 'approver:id,name']);

        if ($booking->user) {
            NotificationDispatcher::notifyUser(
                $booking->user,
                'Booking not approved',
                'Your booking request could not be approved. Please contact us for assistance.',
                '/account/bookings',
                'booking'
            );
        }

        return response()->json([
            'message' => 'Booking rejected.',
            'booking' => BookingPresenter::format($booking),
        ]);
    }
}
