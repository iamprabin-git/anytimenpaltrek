<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmCampaignRecipient extends Model
{
    protected $fillable = [
        'campaign_id',
        'user_id',
        'status',
        'delivery_meta',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'delivery_meta' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(CrmCampaign::class, 'campaign_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
