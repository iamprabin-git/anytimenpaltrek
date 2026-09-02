<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Support\BookingExporter;
use App\Support\ImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        Booking::query()
            ->whereNull('user_id')
            ->where('customer_email', $user->email)
            ->update(['user_id' => $user->id]);

        $bookings = $user->bookings()
            ->with('package:id,title,slug,image,category,price,price_label')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'amount' => $booking->amount,
                'currency' => $booking->currency,
                'status' => $booking->status,
                'created_at' => $booking->created_at,
                'booking_date' => $booking->booking_date?->toDateString(),
                'payment_method' => $booking->payment_method,
                'payment_proof_url' => ImageStorage::url($booking->payment_proof),
                'review_note' => $booking->review_note,
                'approved_at' => $booking->approved_at,
                'package' => $booking->package ? [
                    ...$booking->package->only(['id', 'title', 'slug', 'image', 'category', 'price', 'price_label']),
                    'image_url' => ImageStorage::url($booking->package->image),
                ] : null,
            ]);

        return response()->json($bookings);
    }

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();

        Booking::query()
            ->whereNull('user_id')
            ->where('customer_email', $user->email)
            ->update(['user_id' => $user->id]);

        $bookings = $user->bookings()
            ->with(['package:id,title,slug,category,price,price_label', 'user:id,name,email', 'approver:id,name'])
            ->orderByDesc('created_at')
            ->get();

        $filename = 'my-bookings-'.now()->format('Y-m-d').'.csv';

        return BookingExporter::exportSpreadsheet($bookings, $filename);
    }
}
