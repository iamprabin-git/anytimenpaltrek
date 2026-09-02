<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_PENDING_APPROVAL = 'pending_approval';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_PAID = 'paid';

    public const METHOD_MANUAL = 'manual';

    public const METHOD_COD = 'cod';

    public const METHOD_ONLINE = 'online';

    protected $fillable = [
        'package_id',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'customer_notes',
        'booking_date',
        'amount',
        'currency',
        'payment_method',
        'payment_proof',
        'stripe_session_id',
        'stripe_payment_intent_id',
        'status',
        'approved_by',
        'approved_at',
        'review_note',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'approved_at' => 'datetime',
            'booking_date' => 'date',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isPendingApproval(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING_APPROVAL, self::STATUS_PENDING], true);
    }
}
