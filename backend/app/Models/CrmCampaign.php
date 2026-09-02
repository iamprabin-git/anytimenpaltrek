<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CrmCampaign extends Model
{
    public const TYPE_DEAL = 'deal';

    public const TYPE_LOYALTY = 'loyalty';

    public const TYPE_SEASONAL = 'seasonal';

    public const TYPE_ANNOUNCEMENT = 'announcement';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SENT = 'sent';

    protected $fillable = [
        'created_by',
        'name',
        'campaign_type',
        'segment',
        'segment_value',
        'subject',
        'message',
        'channels',
        'status',
        'recipient_count',
        'email_sent_count',
        'whatsapp_sent_count',
        'in_app_sent_count',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'channels' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(CrmCampaignRecipient::class, 'campaign_id');
    }
}
