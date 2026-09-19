<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Package;
use App\Support\BookingPresenter;
use App\Support\EmailNotifier;
use App\Support\ImageStorage;
use App\Support\NotificationDispatcher;
use App\Support\PackageAvailability;
use App\Support\PaymentSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function checkoutOptions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_slug' => 'required|string|exists:packages,slug',
        ]);

        $package = Package::active()->where('slug', $validated['package_slug'])->firstOrFail();

        if (! $package->price || $package->price <= 0) {
            return response()->json(['message' => 'This package is not available for online booking.'], 422);
        }

        return response()->json([
            'package' => $package->only(['id', 'title', 'slug', 'price', 'price_label', 'short_description', 'category']),
            'payment_settings' => PaymentSettings::presentForCustomer(),
            'online_payment_enabled' => (bool) config('services.stripe.secret'),
        ]);
    }

    public function storeBookingRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_slug' => 'required|string|exists:packages,slug',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_address' => 'required|string|max:1000',
            'customer_notes' => 'nullable|string|max:2000',
            'booking_date' => 'required|date|after_or_equal:today',
            'payment_method' => 'required|in:manual,cod,online',
            'payment_proof' => ImageStorage::fileRules(),
        ]);

        if ($validated['payment_method'] === Booking::METHOD_ONLINE) {
            return response()->json(['message' => 'Online payment is coming soon. Please choose manual payment or cash on delivery.'], 422);
        }

        if ($validated['payment_method'] === Booking::METHOD_MANUAL) {
            if (! PaymentSettings::presentForCustomer()) {
                return response()->json(['message' => 'Manual payment details are not available right now.'], 422);
            }

            if (! $request->hasFile('payment_proof')) {
                return response()->json(['message' => 'Please upload a payment confirmation screenshot.'], 422);
            }
        }

        $package = Package::active()->where('slug', $validated['package_slug'])->firstOrFail();

        if (! PackageAvailability::isBookable($package, $validated['booking_date'])) {
            return response()->json([
                'message' => 'No seats are available for the selected start date. Please choose another date.',
            ], 422);
        }

        $booking = Booking::create([
            'package_id' => $package->id,
            'user_id' => $request->user()?->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'customer_address' => $validated['customer_address'],
            'customer_notes' => $validated['customer_notes'] ?? null,
            'booking_date' => $validated['booking_date'],
            'amount' => $package->price,
            'currency' => 'usd',
            'payment_method' => $validated['payment_method'],
            'payment_proof' => $validated['payment_method'] === Booking::METHOD_MANUAL
                ? ImageStorage::store($request->file('payment_proof'), 'booking-payments', [
                    'max_width' => 1600,
                    'quality' => 85,
                ])
                : null,
            'status' => Booking::STATUS_PENDING_APPROVAL,
        ]);

        $booking->load('package:id,title,slug,price,price_label');

        $this->notifyBookingPendingApproval($booking);

        $frontendUrl = rtrim(config('services.frontend.url'), '/');

        return response()->json([
            'message' => 'Booking request submitted. A manager will review and confirm your booking shortly.',
            'booking' => BookingPresenter::format($booking),
            'redirect_url' => $frontendUrl.'/payment/book?booking_id='.$booking->id.'&email='.urlencode($booking->customer_email),
        ], 201);
    }

    public function createCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_slug' => 'required|string|exists:packages,slug',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
        ]);

        $package = Package::active()->where('slug', $validated['package_slug'])->firstOrFail();

        if (! $package->price || $package->price <= 0) {
            return response()->json(['message' => 'This package is not available for online payment.'], 422);
        }

        $secret = config('services.stripe.secret');
        if (! $secret) {
            return response()->json([
                'message' => 'Use the checkout page to choose manual payment or cash on delivery.',
                'redirect_url' => rtrim(config('services.frontend.url'), '/').'/book/checkout?slug='.urlencode($package->slug),
            ], 422);
        }

        Stripe::setApiKey($secret);

        $frontendUrl = rtrim(config('services.frontend.url'), '/');
        $amountCents = (int) round((float) $package->price * 100);

        $booking = Booking::create([
            'package_id' => $package->id,
            'user_id' => $request->user()?->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'amount' => $package->price,
            'currency' => 'usd',
            'payment_method' => Booking::METHOD_ONLINE,
            'status' => Booking::STATUS_PENDING,
        ]);

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $package->title,
                        'description' => $package->short_description,
                    ],
                    'unit_amount' => $amountCents,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => "{$frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => "{$frontendUrl}/payment/cancel?booking_id={$booking->id}",
            'customer_email' => $validated['customer_email'],
            'metadata' => [
                'booking_id' => (string) $booking->id,
                'package_slug' => $package->slug,
            ],
        ]);

        $booking->update(['stripe_session_id' => $session->id]);

        return response()->json([
            'checkout_url' => $session->url,
            'booking_id' => $booking->id,
            'manual_payment' => false,
        ]);
    }

    public function showManualBooking(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => 'required|integer|exists:bookings,id',
            'email' => 'required|email|max:255',
        ]);

        $booking = Booking::query()
            ->with(['package:id,title,slug,price,price_label', 'approver:id,name'])
            ->where('id', $validated['booking_id'])
            ->where('customer_email', $validated['email'])
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        return response()->json([
            'booking' => BookingPresenter::format($booking),
            'payment_settings' => $booking->payment_method === Booking::METHOD_MANUAL
                ? PaymentSettings::presentForCustomer()
                : null,
        ]);
    }

    public function verifySession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        $booking = Booking::where('stripe_session_id', $validated['session_id'])->with('package')->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking not found.'], 404);
        }

        $secret = config('services.stripe.secret');
        if ($secret && $booking->status === Booking::STATUS_PENDING) {
            Stripe::setApiKey($secret);
            $session = Session::retrieve($validated['session_id']);

            if ($session->payment_status === 'paid') {
                $booking->update([
                    'status' => Booking::STATUS_PAID,
                    'stripe_payment_intent_id' => $session->payment_intent,
                ]);
                $this->notifyBookingPaid($booking->fresh(['package', 'user']));
            }
        }

        return response()->json([
            'booking' => BookingPresenter::format($booking->fresh()->load('package')),
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $secret = config('services.stripe.webhook_secret');
        if (! $secret) {
            return response()->json(['message' => 'Webhook not configured.'], 503);
        }

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                $secret
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $booking = Booking::where('stripe_session_id', $session->id)->first();

            if ($booking && $booking->status !== Booking::STATUS_PAID) {
                $booking->update([
                    'status' => Booking::STATUS_PAID,
                    'stripe_payment_intent_id' => $session->payment_intent,
                ]);
                $this->notifyBookingPaid($booking->fresh(['package', 'user']));
            }
        }

        return response()->json(['received' => true]);
    }

    private function notifyBookingPendingApproval(Booking $booking): void
    {
        $packageTitle = $booking->package?->title ?? 'a package';
        $method = BookingPresenter::paymentMethodLabel($booking->payment_method);

        if ($booking->user) {
            NotificationDispatcher::notifyUser(
                $booking->user,
                'Booking submitted',
                "Your {$method} booking for {$packageTitle} was submitted and is awaiting manager approval.",
                '/account/bookings',
                'booking'
            );
        }

        EmailNotifier::bookingSubmitted($booking);
        EmailNotifier::staffBookingSubmitted($booking);

        NotificationDispatcher::notifyAdmins(
            'Booking awaiting approval',
            "{$booking->customer_name} submitted a {$method} booking for {$packageTitle}.",
            '/agent/payments',
            'booking'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'bookings.approve',
            'Booking awaiting approval',
            "{$booking->customer_name} submitted a {$method} booking for {$packageTitle}.",
            '/agent/payments',
            'booking'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'bookings.view',
            'Booking awaiting approval',
            "{$booking->customer_name} submitted a {$method} booking for {$packageTitle}.",
            '/agent/payments',
            'booking'
        );
    }

    private function notifyBookingPaid(Booking $booking): void
    {
        $packageTitle = $booking->package?->title ?? 'a package';

        if ($booking->user) {
            NotificationDispatcher::notifyUser(
                $booking->user,
                'Payment confirmed',
                "Your booking for {$packageTitle} has been paid successfully.",
                '/account/bookings',
                'booking'
            );
        }

        EmailNotifier::paymentConfirmed($booking);
        EmailNotifier::staffPaymentReceived($booking);

        NotificationDispatcher::notifyAdmins(
            'New paid booking',
            "{$booking->customer_name} paid for {$packageTitle}.",
            '/agent/payments',
            'booking'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'bookings.view',
            'New paid booking',
            "{$booking->customer_name} paid for {$packageTitle}.",
            '/agent/payments',
            'booking'
        );
    }
}
