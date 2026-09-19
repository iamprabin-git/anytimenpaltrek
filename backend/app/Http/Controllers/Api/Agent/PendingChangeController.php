<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\PendingChangeRequest;
use App\Models\User;
use App\Support\ChangeActionApplier;
use App\Support\ChangeApproval;
use App\Support\BrevoMarketing;
use App\Support\BrevoSettings;
use App\Support\EmailNotifier;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PendingChangeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $canReview = $request->user()->hasAgentPermission('approvals.review');
        $query = PendingChangeRequest::query()->with(['requester:id,name,email,agent_role', 'reviewer:id,name']);

        if ($canReview) {
            if ($request->filled('status')) {
                $query->where('status', $request->string('status'));
            } else {
                $query->where('status', PendingChangeRequest::STATUS_PENDING);
            }
        } else {
            $query->where('requested_by', $request->user()->id);
            if ($request->filled('status')) {
                $query->where('status', $request->string('status'));
            }
        }

        $items = $query->latest()->limit(50)->get()->map(fn (PendingChangeRequest $item) => ChangeApproval::format($item));

        return response()->json([
            'can_review' => $canReview,
            'pending_count' => PendingChangeRequest::where('status', PendingChangeRequest::STATUS_PENDING)->count(),
            'changes' => $items,
        ]);
    }

    public function approve(Request $request, PendingChangeRequest $pendingChange): JsonResponse
    {
        if (! $request->user()->hasAgentPermission('approvals.review')) {
            return response()->json(['message' => 'You do not have permission to approve changes.'], 403);
        }

        if ($pendingChange->status !== PendingChangeRequest::STATUS_PENDING) {
            return response()->json(['message' => 'This change request has already been processed.'], 422);
        }

        ChangeActionApplier::apply($pendingChange);

        $pendingChange->update([
            'status' => PendingChangeRequest::STATUS_APPROVED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_note' => $request->input('review_note'),
        ]);

        self::notifyAfterApproval($pendingChange);

        if ($pendingChange->requester) {
            NotificationDispatcher::notifyUser(
                $pendingChange->requester,
                'Change approved',
                "Your submitted change was approved: {$pendingChange->summary}",
                '/agent/approvals',
                'approval'
            );
            EmailNotifier::changeApproved($pendingChange->requester, $pendingChange);
        }

        return response()->json([
            'message' => 'Change approved and applied successfully.',
            'change' => ChangeApproval::format($pendingChange->fresh(['requester', 'reviewer'])),
        ]);
    }

    public function reject(Request $request, PendingChangeRequest $pendingChange): JsonResponse
    {
        if (! $request->user()->hasAgentPermission('approvals.review')) {
            return response()->json(['message' => 'You do not have permission to reject changes.'], 403);
        }

        if ($pendingChange->status !== PendingChangeRequest::STATUS_PENDING) {
            return response()->json(['message' => 'This change request has already been processed.'], 422);
        }

        $validated = $request->validate([
            'review_note' => 'nullable|string|max:1000',
        ]);

        $pendingChange->update([
            'status' => PendingChangeRequest::STATUS_REJECTED,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'review_note' => $validated['review_note'] ?? 'Rejected by manager.',
        ]);

        if ($pendingChange->requester) {
            NotificationDispatcher::notifyUser(
                $pendingChange->requester,
                'Change rejected',
                $validated['review_note'] ?? "Your submitted change was rejected: {$pendingChange->summary}",
                '/agent/approvals',
                'approval'
            );
            EmailNotifier::changeRejected(
                $pendingChange->requester,
                $pendingChange,
                $validated['review_note'] ?? null
            );
        }

        return response()->json([
            'message' => 'Change rejected.',
            'change' => ChangeApproval::format($pendingChange->fresh(['requester', 'reviewer'])),
        ]);
    }

    private static function notifyAfterApproval(PendingChangeRequest $pendingChange): void
    {
        $targetId = $pendingChange->target_id;

        match ($pendingChange->action) {
            'users.create' => self::notifyCustomerCreated($pendingChange),
            'users.approve' => self::notifyCustomerApproved($targetId),
            'users.reject' => self::notifyCustomerRejected($targetId),
            default => null,
        };
    }

    private static function notifyCustomerCreated(PendingChangeRequest $pendingChange): void
    {
        $email = $pendingChange->payload['email'] ?? null;
        if (! $email) {
            return;
        }

        $user = User::query()->where('email', $email)->latest('id')->first();
        if ($user) {
            EmailNotifier::customerWelcome($user);

            if (BrevoSettings::isConfigured() && BrevoSettings::shouldSyncContacts()) {
                BrevoMarketing::syncContact($user);
            }
        }
    }

    private static function notifyCustomerApproved(?int $userId): void
    {
        if (! $userId) {
            return;
        }

        $user = User::find($userId);
        if (! $user) {
            return;
        }

        NotificationDispatcher::notifyUser(
            $user,
            'Account approved',
            'Your account has been approved. You can now sign in and book trips.',
            '/account',
            'user'
        );
        EmailNotifier::accountApproved($user);

        if (BrevoSettings::isConfigured() && BrevoSettings::shouldSyncContacts()) {
            BrevoMarketing::syncContact($user);
        }
    }

    private static function notifyCustomerRejected(?int $userId): void
    {
        if (! $userId) {
            return;
        }

        $user = User::find($userId);
        if (! $user) {
            return;
        }

        NotificationDispatcher::notifyUser(
            $user,
            'Registration not approved',
            'Your account registration could not be approved. Please contact us if you need assistance.',
            '/login',
            'user'
        );
        EmailNotifier::accountRejected($user);
    }
}
