<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\CrmCampaign;
use App\Models\CrmCampaignRecipient;
use App\Models\CrmInteraction;
use App\Models\User;
use App\Support\CrmCampaignService;
use App\Support\CrmCustomerTimeline;
use App\Support\CustomerUserManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmController extends Controller
{
    public function summary(): JsonResponse
    {
        $activeCustomers = User::where('role', User::ROLE_USER)->where('status', User::STATUS_ACTIVE)->count();
        $pendingCustomers = User::where('role', User::ROLE_USER)->where('status', User::STATUS_PENDING)->count();
        $loyaltyMembers = User::where('role', User::ROLE_USER)->where('loyalty_points', '>', 0)->count();
        $draftCampaigns = CrmCampaign::where('status', CrmCampaign::STATUS_DRAFT)->count();
        $sentCampaigns = CrmCampaign::where('status', CrmCampaign::STATUS_SENT)->count();
        $recentNotes = CrmInteraction::with(['user:id,name,email', 'agent:id,name'])
            ->whereIn('type', [
                CrmInteraction::TYPE_NOTE,
                CrmInteraction::TYPE_CALL,
                CrmInteraction::TYPE_EMAIL,
                CrmInteraction::TYPE_WHATSAPP,
                CrmInteraction::TYPE_CAMPAIGN,
            ])
            ->orderByDesc('created_at')
            ->limit(6)
            ->get()
            ->map(fn (CrmInteraction $interaction) => [
                'id' => $interaction->id,
                'type' => $interaction->type,
                'title' => $interaction->title,
                'description' => $interaction->description,
                'customer_name' => $interaction->user?->name,
                'customer_id' => $interaction->user_id,
                'agent_name' => $interaction->agent?->name,
                'created_at' => $interaction->created_at,
            ]);

        return response()->json([
            'stats' => [
                'active_customers' => $activeCustomers,
                'pending_customers' => $pendingCustomers,
                'loyalty_members' => $loyaltyMembers,
                'draft_campaigns' => $draftCampaigns,
                'sent_campaigns' => $sentCampaigns,
            ],
            'recent_interactions' => $recentNotes,
            'segments' => CrmCampaignService::segments(),
            'campaign_types' => CrmCampaignService::campaignTypes(),
            'channels' => CrmCampaignService::channels(),
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        $users = CustomerUserManager::customerQuery($request)->withCount('bookings')->get();

        return response()->json($users->map(function (User $user) {
            $formatted = CustomerUserManager::formatUser($user);

            return [
                ...$formatted,
                'interaction_count' => CrmCustomerTimeline::interactionCount($user),
                'bookings_count' => $user->bookings_count,
            ];
        }));
    }

    public function showCustomer(User $user): JsonResponse
    {
        abort_unless($user->role === User::ROLE_USER, 404);

        return response()->json([
            'customer' => [
                ...CustomerUserManager::formatUser($user),
                'bookings_count' => $user->bookings()->count(),
            ],
            'timeline' => CrmCustomerTimeline::forUser($user),
        ]);
    }

    public function storeInteraction(Request $request, User $user): JsonResponse
    {
        abort_unless($user->role === User::ROLE_USER, 404);

        $validated = $request->validate([
            'type' => 'required|in:note,call,email',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
        ]);

        $interaction = CrmInteraction::create([
            'user_id' => $user->id,
            'agent_id' => $request->user()->id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Interaction logged.',
            'interaction' => $interaction,
            'timeline' => CrmCustomerTimeline::forUser($user->fresh()),
        ], 201);
    }

    public function updateLoyalty(Request $request, User $user): JsonResponse
    {
        abort_unless($user->role === User::ROLE_USER, 404);

        $validated = $request->validate([
            'loyalty_points' => 'required|integer|min:0|max:1000000',
            'note' => 'nullable|string|max:1000',
        ]);

        $previous = (int) ($user->loyalty_points ?? 0);
        $user->update(['loyalty_points' => $validated['loyalty_points']]);

        if (($validated['note'] ?? '') !== '') {
            CrmInteraction::create([
                'user_id' => $user->id,
                'agent_id' => $request->user()->id,
                'type' => CrmInteraction::TYPE_NOTE,
                'title' => 'Loyalty points updated',
                'description' => $validated['note'],
                'metadata' => [
                    'previous_points' => $previous,
                    'new_points' => $validated['loyalty_points'],
                ],
            ]);
        }

        return response()->json([
            'message' => 'Loyalty points updated.',
            'customer' => CustomerUserManager::formatUser($user->fresh()),
            'timeline' => CrmCustomerTimeline::forUser($user->fresh()),
        ]);
    }

    public function campaigns(): JsonResponse
    {
        $campaigns = CrmCampaign::with('creator:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CrmCampaign $campaign) => self::formatCampaign($campaign));

        return response()->json($campaigns);
    }

    public function storeCampaign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'campaign_type' => 'required|in:deal,loyalty,seasonal,announcement',
            'segment' => 'required|in:all_active,with_bookings,pending_customers,loyalty_members,by_country',
            'segment_value' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'channels' => 'nullable|array|min:1',
            'channels.*' => 'in:in_app,email,whatsapp',
            'send_now' => 'nullable|boolean',
        ]);

        $channels = CrmCampaignService::normalizeChannels($validated['channels'] ?? [CrmCampaignService::CHANNEL_IN_APP]);

        $campaign = CrmCampaign::create([
            'created_by' => $request->user()->id,
            'name' => $validated['name'],
            'campaign_type' => $validated['campaign_type'],
            'segment' => $validated['segment'],
            'segment_value' => $validated['segment_value'] ?? null,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'channels' => $channels,
            'status' => CrmCampaign::STATUS_DRAFT,
        ]);

        if ($request->boolean('send_now')) {
            CrmCampaignService::send($campaign, $request->user());
        }

        return response()->json([
            'message' => $request->boolean('send_now') ? 'Campaign sent to customers.' : 'Campaign saved as draft.',
            'campaign' => self::formatCampaign($campaign->fresh(['creator:id,name'])),
        ], 201);
    }

    public function sendCampaign(Request $request, CrmCampaign $campaign): JsonResponse
    {
        if ($campaign->status === CrmCampaign::STATUS_SENT) {
            return response()->json(['message' => 'Campaign has already been sent.'], 422);
        }

        CrmCampaignService::send($campaign, $request->user());

        return response()->json([
            'message' => 'Campaign sent to customers.',
            'campaign' => self::formatCampaign($campaign->fresh(['creator:id,name'])),
        ]);
    }

    public function campaignRecipients(CrmCampaign $campaign): JsonResponse
    {
        $recipients = $campaign->recipients()
            ->with('user:id,name,email,phone,whatsapp_number,country')
            ->orderByDesc('sent_at')
            ->get()
            ->flatMap(function (CrmCampaignRecipient $recipient) {
                $deliveryMeta = is_array($recipient->delivery_meta) ? $recipient->delivery_meta : [];
                $rows = [];

                foreach ($deliveryMeta as $channel => $meta) {
                    if (! is_array($meta)) {
                        continue;
                    }

                    $rows[] = [
                        'id' => $recipient->id,
                        'channel' => $channel,
                        'status' => $meta['status'] ?? $recipient->status,
                        'sent_at' => $meta['sent_at'] ?? $recipient->sent_at,
                        'delivery_meta' => $meta,
                        'customer' => $recipient->user ? [
                            'id' => $recipient->user->id,
                            'name' => $recipient->user->name,
                            'email' => $recipient->user->email,
                            'phone' => $recipient->user->phone,
                            'whatsapp_number' => $recipient->user->whatsapp_number,
                            'country' => $recipient->user->country,
                        ] : null,
                    ];
                }

                return $rows;
            })
            ->values();

        return response()->json([
            'campaign' => self::formatCampaign($campaign),
            'recipients' => $recipients,
        ]);
    }

    private static function formatCampaign(CrmCampaign $campaign): array
    {
        return [
            'id' => $campaign->id,
            'name' => $campaign->name,
            'campaign_type' => $campaign->campaign_type,
            'segment' => $campaign->segment,
            'segment_value' => $campaign->segment_value,
            'subject' => $campaign->subject,
            'message' => $campaign->message,
            'channels' => CrmCampaignService::normalizeChannels($campaign->channels ?? [CrmCampaignService::CHANNEL_IN_APP]),
            'status' => $campaign->status,
            'recipient_count' => $campaign->recipient_count,
            'email_sent_count' => $campaign->email_sent_count ?? 0,
            'whatsapp_sent_count' => $campaign->whatsapp_sent_count ?? 0,
            'in_app_sent_count' => $campaign->in_app_sent_count ?? 0,
            'sent_at' => $campaign->sent_at,
            'created_at' => $campaign->created_at,
            'creator' => $campaign->creator ? [
                'id' => $campaign->creator->id,
                'name' => $campaign->creator->name,
            ] : null,
        ];
    }
}
