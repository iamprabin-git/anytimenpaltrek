<?php

namespace App\Support;

use App\Models\CompanySetting;
use App\Models\CrmCampaign;
use App\Models\CrmCampaignRecipient;
use App\Models\CrmInteraction;
use App\Models\User;
use App\Notifications\MarketingCampaignNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class CrmCampaignService
{
    public const CHANNEL_IN_APP = 'in_app';

    public const CHANNEL_EMAIL = 'email';

    public const CHANNEL_WHATSAPP = 'whatsapp';

    public static function segments(): array
    {
        return [
            'all_active' => 'All active customers',
            'with_bookings' => 'Customers with bookings',
            'pending_customers' => 'Pending approval customers',
            'loyalty_members' => 'Customers with loyalty points',
            'by_country' => 'Customers by country',
        ];
    }

    public static function campaignTypes(): array
    {
        return [
            CrmCampaign::TYPE_DEAL => 'Personalized trek & tour deal',
            CrmCampaign::TYPE_LOYALTY => 'Loyalty points update',
            CrmCampaign::TYPE_SEASONAL => 'Seasonal promotion',
            CrmCampaign::TYPE_ANNOUNCEMENT => 'General announcement',
        ];
    }

    public static function channels(): array
    {
        return [
            self::CHANNEL_IN_APP => 'In-app notification',
            self::CHANNEL_EMAIL => 'Email marketing',
            self::CHANNEL_WHATSAPP => 'WhatsApp marketing',
        ];
    }

    /** @return list<string> */
    public static function normalizeChannels(array $channels): array
    {
        $allowed = array_keys(self::channels());
        $normalized = array_values(array_unique(array_filter(
            $channels,
            fn (string $channel) => in_array($channel, $allowed, true)
        )));

        return $normalized !== [] ? $normalized : [self::CHANNEL_IN_APP];
    }

    /** @return Collection<int, User> */
    public static function resolveRecipients(CrmCampaign $campaign): Collection
    {
        $query = User::query()
            ->where('role', User::ROLE_USER);

        return match ($campaign->segment) {
            'with_bookings' => $query->whereHas('bookings')->get(),
            'pending_customers' => $query->where('status', User::STATUS_PENDING)->get(),
            'loyalty_members' => $query->where('loyalty_points', '>', 0)->get(),
            'by_country' => $query
                ->when(
                    filled($campaign->segment_value),
                    fn ($builder) => $builder->where('country', $campaign->segment_value)
                )
                ->get(),
            default => $query->where('status', User::STATUS_ACTIVE)->get(),
        };
    }

    public static function personalize(string $template, User $user): string
    {
        $companyName = CompanySetting::current()->company_name ?? 'Anytime Nepal Trek';

        return str_replace(
            ['{name}', '{email}', '{loyalty_points}', '{company_name}', '{country}'],
            [
                $user->name,
                $user->email,
                (string) ($user->loyalty_points ?? 0),
                $companyName,
                $user->country ?? 'your region',
            ],
            $template
        );
    }

    public static function send(CrmCampaign $campaign, User $agent): CrmCampaign
    {
        if ($campaign->status === CrmCampaign::STATUS_SENT) {
            return $campaign;
        }

        $recipients = self::resolveRecipients($campaign);
        $channels = self::normalizeChannels($campaign->channels ?? [self::CHANNEL_IN_APP]);
        $emailSent = 0;
        $whatsappSent = 0;
        $inAppSent = 0;
        $totalDeliveries = 0;

        foreach ($recipients as $recipient) {
            $subject = self::personalize($campaign->subject, $recipient);
            $message = self::personalize($campaign->message, $recipient);

            foreach ($channels as $channel) {
                $result = match ($channel) {
                    self::CHANNEL_EMAIL => self::deliverEmail($campaign, $recipient, $agent, $subject, $message),
                    self::CHANNEL_WHATSAPP => self::deliverWhatsapp($campaign, $recipient, $agent, $subject, $message),
                    default => self::deliverInApp($campaign, $recipient, $agent, $subject, $message),
                };

                if ($result['counted']) {
                    $totalDeliveries++;
                }

                match ($channel) {
                    self::CHANNEL_EMAIL => $emailSent += $result['counted'] ? 1 : 0,
                    self::CHANNEL_WHATSAPP => $whatsappSent += $result['counted'] ? 1 : 0,
                    default => $inAppSent += $result['counted'] ? 1 : 0,
                };
            }
        }

        $campaign->update([
            'status' => CrmCampaign::STATUS_SENT,
            'recipient_count' => $totalDeliveries,
            'email_sent_count' => $emailSent,
            'whatsapp_sent_count' => $whatsappSent,
            'in_app_sent_count' => $inAppSent,
            'sent_at' => now(),
        ]);

        return $campaign->fresh(['creator:id,name']);
    }

    /** @return array{counted: bool, status: string} */
    private static function deliverInApp(
        CrmCampaign $campaign,
        User $recipient,
        User $agent,
        string $subject,
        string $message
    ): array {
        NotificationDispatcher::notifyUser(
            $recipient,
            $subject,
            $message,
            '/account',
            'marketing'
        );

        self::recordDelivery($campaign, $recipient, $agent, self::CHANNEL_IN_APP, 'sent', [
            'subject' => $subject,
        ], $subject, $message);

        return ['counted' => true, 'status' => 'sent'];
    }

    /** @return array{counted: bool, status: string} */
    private static function deliverEmail(
        CrmCampaign $campaign,
        User $recipient,
        User $agent,
        string $subject,
        string $message
    ): array {
        if (! filled($recipient->email)) {
            self::recordDelivery($campaign, $recipient, $agent, self::CHANNEL_EMAIL, 'skipped', [
                'reason' => 'missing_email',
            ], $subject, $message);

            return ['counted' => false, 'status' => 'skipped'];
        }

        try {
            $recipient->notify(new MarketingCampaignNotification($subject, $message));

            self::recordDelivery($campaign, $recipient, $agent, self::CHANNEL_EMAIL, 'sent', [
                'email' => $recipient->email,
                'subject' => $subject,
            ], $subject, $message);

            return ['counted' => true, 'status' => 'sent'];
        } catch (\Throwable $exception) {
            Log::warning('CRM email campaign delivery failed', [
                'campaign_id' => $campaign->id,
                'user_id' => $recipient->id,
                'error' => $exception->getMessage(),
            ]);

            self::recordDelivery($campaign, $recipient, $agent, self::CHANNEL_EMAIL, 'failed', [
                'email' => $recipient->email,
                'error' => $exception->getMessage(),
            ], $subject, $message);

            return ['counted' => false, 'status' => 'failed'];
        }
    }

    /** @return array{counted: bool, status: string} */
    private static function deliverWhatsapp(
        CrmCampaign $campaign,
        User $recipient,
        User $agent,
        string $subject,
        string $message
    ): array {
        $whatsappMessage = trim($subject."\n\n".$message);
        $whatsappUrl = WhatsappMarketing::buildUrl($recipient, $whatsappMessage);
        $whatsappNumber = WhatsappMarketing::resolveNumber($recipient);

        if (! $whatsappUrl) {
            self::recordDelivery($campaign, $recipient, $agent, self::CHANNEL_WHATSAPP, 'skipped', [
                'reason' => 'missing_whatsapp_number',
            ], $subject, $message);

            return ['counted' => false, 'status' => 'skipped'];
        }

        self::recordDelivery($campaign, $recipient, $agent, self::CHANNEL_WHATSAPP, 'ready', [
            'whatsapp_number' => $whatsappNumber,
            'whatsapp_url' => $whatsappUrl,
            'message' => $whatsappMessage,
        ], $subject, $message);

        return ['counted' => true, 'status' => 'ready'];
    }

    /** @param  array<string, mixed>  $meta */
    private static function recordDelivery(
        CrmCampaign $campaign,
        User $recipient,
        User $agent,
        string $channel,
        string $status,
        array $meta,
        string $subject,
        string $message
    ): void {
        $record = CrmCampaignRecipient::firstOrNew([
            'campaign_id' => $campaign->id,
            'user_id' => $recipient->id,
        ]);

        $deliveryMeta = is_array($record->delivery_meta) ? $record->delivery_meta : [];
        $deliveryMeta[$channel] = array_merge($meta, [
            'status' => $status,
            'sent_at' => now()->toIso8601String(),
        ]);

        $record->fill([
            'status' => 'sent',
            'delivery_meta' => $deliveryMeta,
            'sent_at' => now(),
        ]);
        $record->save();

        CrmInteraction::create([
            'user_id' => $recipient->id,
            'agent_id' => $agent->id,
            'type' => $channel === self::CHANNEL_WHATSAPP ? CrmInteraction::TYPE_WHATSAPP : ($channel === self::CHANNEL_EMAIL ? CrmInteraction::TYPE_EMAIL : CrmInteraction::TYPE_CAMPAIGN),
            'title' => $subject,
            'description' => $message,
            'metadata' => [
                'campaign_id' => $campaign->id,
                'campaign_type' => $campaign->campaign_type,
                'channel' => $channel,
                'delivery_status' => $status,
            ],
        ]);
    }
}
