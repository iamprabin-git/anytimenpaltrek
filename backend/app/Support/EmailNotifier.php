<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\ContactInquiry;
use App\Models\PendingChangeRequest;
use App\Models\Review;
use App\Models\User;
use App\Notifications\TransactionalEmailNotification;
use Illuminate\Support\Facades\Notification;

class EmailNotifier
{
    public static function send(User $user, EmailTemplate $template): void
    {
        if (! $user->email) {
            return;
        }

        $user->notify(new TransactionalEmailNotification($template, $user->name));
    }

    public static function sendToAddress(string $email, string $name, EmailTemplate $template): void
    {
        if (! filled($email)) {
            return;
        }

        Notification::route('mail', [$email => $name])
            ->notify(new TransactionalEmailNotification($template, $name));
    }

    public static function sendToBookingCustomer(Booking $booking, EmailTemplate $template): void
    {
        if ($booking->user) {
            self::send($booking->user, $template);

            return;
        }

        self::sendToAddress($booking->customer_email, $booking->customer_name, $template);
    }

    /** @param  callable(User): void  $sender */
    public static function notifyStaff(callable $sender): void
    {
        User::query()
            ->whereIn('role', [User::ROLE_ADMIN, User::ROLE_AGENT])
            ->where('status', User::STATUS_ACTIVE)
            ->each(fn (User $staff) => $sender($staff));
    }

    public static function notifyStaffWithPermission(string $permission, EmailTemplate $template, ?string $actionUrl = null): void
    {
        $finalTemplate = $actionUrl && ! $template->actionUrl
            ? new EmailTemplate(
                $template->subject,
                $template->headline,
                $template->intro,
                $template->lines,
                $template->details,
                $template->actionText ?? 'Open in portal',
                $actionUrl,
                $template->footerNote,
            )
            : $template;

        User::query()
            ->where('role', User::ROLE_AGENT)
            ->where('status', User::STATUS_ACTIVE)
            ->get()
            ->filter(fn (User $user) => $user->hasAgentPermission($permission))
            ->each(fn (User $user) => self::send($user, $finalTemplate));

        User::query()
            ->where('role', User::ROLE_ADMIN)
            ->where('status', User::STATUS_ACTIVE)
            ->each(fn (User $user) => self::send($user, $finalTemplate));
    }

    public static function registrationPending(User $user): void
    {
        self::send($user, new EmailTemplate(
            subject: 'Registration received',
            headline: 'Thank you for registering',
            intro: 'We have received your registration and our team is reviewing your account.',
            lines: [
                'Once approved, you will receive another email and can sign in to browse treks, book tours, and manage your trips.',
            ],
            details: [
                'Name' => $user->name,
                'Email' => $user->email,
                'Status' => 'Pending approval',
            ],
            actionText: 'Visit our website',
            actionUrl: EmailBranding::frontendUrl(),
            footerNote: 'You do not need to take any further action right now.',
        ));
    }

    public static function staffNewRegistration(User $user, string $source = 'Website'): void
    {
        self::notifyStaffWithPermission('users.approve', new EmailTemplate(
            subject: 'New customer registration',
            headline: 'New registration awaiting approval',
            intro: 'A new customer has registered and is waiting for account approval.',
            details: [
                'Name' => $user->name,
                'Email' => $user->email,
                'Phone' => $user->phone,
                'Country' => $user->country,
                'Source' => $source,
            ],
            actionText: 'Review customer',
            actionUrl: EmailBranding::frontendUrl().'/agent/users',
        ));
    }

    public static function accountApproved(User $user): void
    {
        self::send($user, new EmailTemplate(
            subject: 'Account approved',
            headline: 'Your account is now active',
            intro: 'Great news — your account has been approved by our team.',
            lines: [
                'You can now sign in, explore packages, submit bookings, and manage your profile from your customer dashboard.',
            ],
            details: [
                'Name' => $user->name,
                'Email' => $user->email,
                'Status' => 'Active',
            ],
            actionText: 'Sign in to your account',
            actionUrl: EmailBranding::loginUrl('user'),
        ));
    }

    public static function accountRejected(User $user): void
    {
        self::send($user, new EmailTemplate(
            subject: 'Registration update',
            headline: 'Registration could not be approved',
            intro: 'We reviewed your registration request, but your account could not be approved at this time.',
            lines: [
                'If you believe this is a mistake or would like more information, please contact our support team.',
            ],
            details: [
                'Name' => $user->name,
                'Email' => $user->email,
                'Status' => 'Not approved',
            ],
            actionText: 'Contact support',
            actionUrl: EmailBranding::frontendUrl().'/contact',
        ));
    }

    public static function agentWelcome(User $agent, ?string $createdBy = null): void
    {
        self::send($agent, new EmailTemplate(
            subject: 'Welcome to the agent portal',
            headline: 'Your agent account is ready',
            intro: 'An administrator has created your agent account for '.EmailBranding::companyName().'.',
            lines: array_filter([
                $createdBy ? "Account created by: {$createdBy}" : null,
                'Use the email address and password provided by your administrator to sign in.',
                'From the agent portal you can manage bookings, customers, packages, CRM campaigns, and more.',
            ]),
            details: [
                'Name' => $agent->name,
                'Email' => $agent->email,
                'Role' => AgentPermissions::roleLabel($agent->agent_role),
                'Status' => 'Active',
            ],
            actionText: 'Go to agent login',
            actionUrl: EmailBranding::loginUrl('agent'),
        ));
    }

    public static function customerWelcome(User $customer, ?string $createdBy = null): void
    {
        $isActive = $customer->isActive();

        self::send($customer, new EmailTemplate(
            subject: 'Welcome to '.EmailBranding::companyName(),
            headline: $isActive ? 'Your customer account is ready' : 'Your customer account was created',
            intro: $isActive
                ? 'Your customer account has been created and is ready to use.'
                : 'Your customer account has been created and is pending approval.',
            lines: array_filter([
                $createdBy ? "Account created by: {$createdBy}" : null,
                $isActive
                    ? 'Sign in to browse treks and tours, submit bookings, and manage your travel profile.'
                    : 'We will email you once your account has been approved.',
            ]),
            details: [
                'Name' => $customer->name,
                'Email' => $customer->email,
                'Status' => $isActive ? 'Active' : 'Pending approval',
            ],
            actionText: $isActive ? 'Sign in now' : null,
            actionUrl: $isActive ? EmailBranding::loginUrl('user') : null,
        ));
    }

    public static function passwordResetSuccess(User $user, string $portal = 'user'): void
    {
        self::send($user, new EmailTemplate(
            subject: 'Password changed successfully',
            headline: 'Your password was updated',
            intro: 'This confirms that your account password was changed successfully.',
            lines: [
                'If you did not make this change, please contact us immediately so we can secure your account.',
            ],
            details: [
                'Account' => $user->email,
                'Portal' => ucfirst($portal === 'user' ? 'Customer' : $portal),
                'Changed at' => now()->format('F j, Y g:i A'),
            ],
            actionText: 'Sign in',
            actionUrl: EmailBranding::loginUrl($portal),
        ));
    }

    public static function contactConfirmation(string $email, string $name, ?string $subject, ?string $message = null): void
    {
        self::sendToAddress($email, $name, new EmailTemplate(
            subject: 'We received your message',
            headline: 'Thank you for contacting us',
            intro: 'We have received your inquiry and a member of our team will respond shortly.',
            details: array_filter([
                'Subject' => $subject ?: 'General inquiry',
                'Submitted by' => $name,
                'Email' => $email,
            ]),
            lines: $message ? ['Your message:', $message] : [],
            actionText: 'Visit our website',
            actionUrl: EmailBranding::frontendUrl(),
            footerNote: 'Our team typically responds within one business day.',
        ));
    }

    public static function staffContactInquiry(ContactInquiry $inquiry): void
    {
        self::notifyStaffWithPermission('inquiries.view', new EmailTemplate(
            subject: 'New contact inquiry',
            headline: 'New message from website contact form',
            intro: 'A visitor submitted a new inquiry through the contact page.',
            details: [
                'Name' => $inquiry->name,
                'Email' => $inquiry->email,
                'Phone' => $inquiry->phone,
                'Subject' => $inquiry->subject ?: 'General inquiry',
            ],
            lines: $inquiry->message ? ['Message:', $inquiry->message] : [],
            actionText: 'View inquiries',
            actionUrl: EmailBranding::frontendUrl().'/agent/inquiries',
        ));
    }

    public static function bookingSubmitted(Booking $booking): void
    {
        self::sendToBookingCustomer($booking, new EmailTemplate(
            subject: 'Booking request received',
            headline: 'Your booking request has been submitted',
            intro: 'Thank you for choosing '.EmailBranding::companyName().'. We have received your booking request and our team will review it shortly.',
            lines: [
                'You will receive another email once your booking has been confirmed or if we need additional information.',
            ],
            details: BookingEmailDetails::summary($booking, 'Awaiting approval'),
            actionText: 'View booking details',
            actionUrl: EmailBranding::bookingsUrl(),
        ));
    }

    public static function staffBookingSubmitted(Booking $booking): void
    {
        self::notifyStaffWithPermission('bookings.approve', new EmailTemplate(
            subject: 'Booking awaiting approval',
            headline: 'New booking requires review',
            intro: 'A customer submitted a new booking that needs manager approval.',
            details: BookingEmailDetails::summary($booking, 'Awaiting approval'),
            actionText: 'Review booking',
            actionUrl: EmailBranding::frontendUrl().'/agent/payments',
        ));
    }

    public static function bookingConfirmed(Booking $booking): void
    {
        self::sendToBookingCustomer($booking, new EmailTemplate(
            subject: 'Booking confirmed',
            headline: 'Your booking is confirmed',
            intro: 'Good news — your booking has been reviewed and confirmed by our team.',
            lines: array_filter([
                $booking->review_note ? 'Note from our team: '.$booking->review_note : null,
                'We look forward to hosting you on your adventure.',
            ]),
            details: BookingEmailDetails::summary($booking, 'Confirmed'),
            actionText: 'View your booking',
            actionUrl: EmailBranding::bookingsUrl(),
        ));
    }

    public static function bookingRejected(Booking $booking): void
    {
        self::sendToBookingCustomer($booking, new EmailTemplate(
            subject: 'Booking update',
            headline: 'Your booking could not be confirmed',
            intro: 'We reviewed your booking request, but we were unable to confirm it at this time.',
            lines: array_filter([
                $booking->review_note ? 'Reason: '.$booking->review_note : 'Please contact us if you would like help choosing another date or package.',
            ]),
            details: BookingEmailDetails::summary($booking, 'Not confirmed'),
            actionText: 'Contact support',
            actionUrl: EmailBranding::frontendUrl().'/contact',
        ));
    }

    public static function paymentConfirmed(Booking $booking): void
    {
        self::sendToBookingCustomer($booking, new EmailTemplate(
            subject: 'Payment received',
            headline: 'Payment confirmed',
            intro: 'We have successfully received your payment. Thank you!',
            lines: [
                'Your booking payment has been recorded. Our team will finalize any remaining travel arrangements and contact you if needed.',
            ],
            details: BookingEmailDetails::summary($booking, 'Paid'),
            actionText: 'View payment & booking',
            actionUrl: EmailBranding::bookingsUrl(),
        ));
    }

    public static function staffPaymentReceived(Booking $booking): void
    {
        self::notifyStaffWithPermission('bookings.view', new EmailTemplate(
            subject: 'Payment received',
            headline: 'Customer payment confirmed',
            intro: 'A booking payment has been successfully received.',
            details: BookingEmailDetails::summary($booking, 'Paid'),
            actionText: 'View booking',
            actionUrl: EmailBranding::frontendUrl().'/agent/payments',
        ));
    }

    public static function reviewSubmitted(User $customer, Review $review): void
    {
        self::send($customer, new EmailTemplate(
            subject: 'Review submitted',
            headline: 'Thank you for your review',
            intro: 'We have received your review and it is now awaiting approval by our team.',
            details: [
                'Rating' => str_repeat('★', (int) $review->rating).str_repeat('☆', 5 - (int) $review->rating),
                'Status' => 'Pending approval',
            ],
            lines: ['Once approved, your review will appear on our website.'],
            actionText: 'Visit our website',
            actionUrl: EmailBranding::frontendUrl(),
        ));
    }

    public static function staffReviewSubmitted(User $customer, Review $review): void
    {
        self::notifyStaffWithPermission('reviews.approve', new EmailTemplate(
            subject: 'Review awaiting approval',
            headline: 'New customer review submitted',
            intro: "{$customer->name} submitted a review that needs approval.",
            details: [
                'Customer' => $customer->name,
                'Email' => $customer->email,
                'Rating' => (string) $review->rating.'/5',
            ],
            actionText: 'Review submission',
            actionUrl: EmailBranding::frontendUrl().'/agent/reviews',
        ));
    }

    public static function reviewApproved(User $customer, Review $review): void
    {
        self::send($customer, new EmailTemplate(
            subject: 'Review published',
            headline: 'Your review is now live',
            intro: 'Your review has been approved and is now visible on our website.',
            details: [
                'Rating' => (string) $review->rating.'/5',
                'Status' => 'Published',
            ],
            lines: ['Thank you for sharing your experience with other travelers.'],
            actionText: 'Visit our website',
            actionUrl: EmailBranding::frontendUrl(),
        ));
    }

    public static function reviewRejected(User $customer, Review $review): void
    {
        self::send($customer, new EmailTemplate(
            subject: 'Review update',
            headline: 'Your review was not published',
            intro: 'We reviewed your submission, but your review could not be published at this time.',
            details: [
                'Rating' => (string) $review->rating.'/5',
                'Status' => 'Not published',
            ],
            lines: ['Contact our support team if you have questions about this decision.'],
            actionText: 'Contact support',
            actionUrl: EmailBranding::frontendUrl().'/contact',
        ));
    }

    public static function changeSubmitted(PendingChangeRequest $change, User $requester): void
    {
        self::notifyStaffWithPermission('approvals.review', new EmailTemplate(
            subject: 'Change awaiting approval',
            headline: 'Agent change request submitted',
            intro: 'An agent submitted a change that requires manager approval.',
            details: [
                'Requested by' => $requester->name,
                'Role' => AgentPermissions::roleLabel($requester->agent_role),
                'Summary' => $change->summary,
                'Action' => $change->action,
            ],
            actionText: 'Review change',
            actionUrl: EmailBranding::frontendUrl().'/agent/approvals',
        ));
    }

    public static function changeApproved(User $requester, PendingChangeRequest $change): void
    {
        self::send($requester, new EmailTemplate(
            subject: 'Change approved',
            headline: 'Your change request was approved',
            intro: 'A manager has approved and applied your submitted change.',
            details: [
                'Summary' => $change->summary,
                'Status' => 'Approved',
                'Reviewed at' => $change->reviewed_at?->format('F j, Y g:i A') ?? now()->format('F j, Y g:i A'),
            ],
            actionText: 'Open approvals',
            actionUrl: EmailBranding::frontendUrl().'/agent/approvals',
        ));
    }

    public static function changeRejected(User $requester, PendingChangeRequest $change, ?string $note = null): void
    {
        self::send($requester, new EmailTemplate(
            subject: 'Change rejected',
            headline: 'Your change request was rejected',
            intro: 'A manager reviewed your submitted change and did not approve it.',
            details: [
                'Summary' => $change->summary,
                'Status' => 'Rejected',
                'Review note' => $note ?? $change->review_note,
            ],
            actionText: 'Open approvals',
            actionUrl: EmailBranding::frontendUrl().'/agent/approvals',
        ));
    }

    public static function staffSuggestion(string $customerName, string $summary): void
    {
        self::notifyStaffWithPermission('inquiries.view', new EmailTemplate(
            subject: 'New customer suggestion',
            headline: 'Customer suggestion received',
            intro: 'A customer submitted a new suggestion from their account.',
            details: [
                'Customer' => $customerName,
                'Summary' => $summary,
            ],
            actionText: 'Open agent panel',
            actionUrl: EmailBranding::frontendUrl().'/agent/inquiries',
        ));
    }

    public static function staffMessage(string $customerName, string $subject, string $message): void
    {
        self::notifyStaffWithPermission('inquiries.view', new EmailTemplate(
            subject: 'New staff message',
            headline: 'Customer message to staff',
            intro: 'A customer sent a message through the Contact Staff page.',
            details: [
                'Customer' => $customerName,
                'Subject' => $subject,
            ],
            lines: ['Message:', $message],
            actionText: 'Open inquiries',
            actionUrl: EmailBranding::frontendUrl().'/agent/inquiries',
        ));
    }

    public static function suggestionReceived(User $user, string $subject): void
    {
        self::send($user, new EmailTemplate(
            subject: 'Suggestion received',
            headline: 'Thank you for your suggestion',
            intro: 'We have received your suggestion and our team will review it.',
            details: [
                'Subject' => $subject,
                'Status' => 'Received',
            ],
            actionText: 'Open your account',
            actionUrl: EmailBranding::accountUrl(),
        ));
    }

    public static function staffMessageSent(User $user, string $subject): void
    {
        self::send($user, new EmailTemplate(
            subject: 'Message sent to staff',
            headline: 'Your message was delivered',
            intro: 'Your message has been sent to our staff team.',
            details: [
                'Subject' => $subject,
                'Status' => 'Sent',
            ],
            lines: ['A team member will respond as soon as possible.'],
            actionText: 'View your account',
            actionUrl: EmailBranding::accountUrl(),
        ));
    }
}
