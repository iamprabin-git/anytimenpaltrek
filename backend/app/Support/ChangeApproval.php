<?php

namespace App\Support;

use App\Models\PendingChangeRequest;
use App\Models\User;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChangeApproval
{
    public static function requiresApproval(User $agent): bool
    {
        if (! $agent->isAgent() || ! $agent->agent_role) {
            return false;
        }

        return ! in_array($agent->agent_role, AgentPermissions::immediateApprovalRoles(), true);
    }

    public static function submit(
        User $agent,
        string $action,
        string $targetType,
        ?int $targetId,
        array $payload,
        string $summary
    ): PendingChangeRequest {
        $pending = PendingChangeRequest::create([
            'requested_by' => $agent->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'payload' => $payload,
            'summary' => $summary,
            'status' => PendingChangeRequest::STATUS_PENDING,
        ]);

        NotificationDispatcher::notifyAgentsWithPermission(
            'approvals.review',
            'Change awaiting approval',
            "{$agent->name} (".AgentPermissions::roleLabel($agent->agent_role).") submitted: {$summary}",
            '/agent/approvals',
            'approval'
        );

        NotificationDispatcher::notifyAdmins(
            'Change awaiting approval',
            "{$agent->name} submitted a change for manager review: {$summary}",
            '/admin/roles',
            'approval'
        );

        return $pending->load('requester:id,name,email,agent_role');
    }

    public static function pendingResponse(PendingChangeRequest $pending): JsonResponse
    {
        return response()->json([
            'message' => 'Change submitted for manager approval.',
            'requires_approval' => true,
            'pending_change' => self::format($pending),
        ], 202);
    }

    /**
     * @return array<string, mixed>
     */
    public static function format(PendingChangeRequest $pending): array
    {
        $pending->loadMissing(['requester:id,name,email,agent_role', 'reviewer:id,name,email,agent_role']);

        return [
            'id' => $pending->id,
            'action' => $pending->action,
            'target_type' => $pending->target_type,
            'target_id' => $pending->target_id,
            'payload' => $pending->payload,
            'summary' => $pending->summary,
            'status' => $pending->status,
            'review_note' => $pending->review_note,
            'created_at' => $pending->created_at,
            'reviewed_at' => $pending->reviewed_at,
            'requester' => $pending->requester ? [
                'id' => $pending->requester->id,
                'name' => $pending->requester->name,
                'email' => $pending->requester->email,
                'agent_role' => $pending->requester->agent_role,
                'agent_role_label' => AgentPermissions::roleLabel($pending->requester->agent_role),
            ] : null,
            'reviewer' => $pending->reviewer ? [
                'id' => $pending->reviewer->id,
                'name' => $pending->reviewer->name,
            ] : null,
        ];
    }

    public static function executeOrSubmit(
        Request $request,
        string $action,
        string $targetType,
        ?int $targetId,
        array $payload,
        string $summary,
        callable $immediate
    ): JsonResponse {
        if (self::requiresApproval($request->user())) {
            return self::pendingResponse(
                self::submit($request->user(), $action, $targetType, $targetId, $payload, $summary)
            );
        }

        return $immediate();
    }
}
