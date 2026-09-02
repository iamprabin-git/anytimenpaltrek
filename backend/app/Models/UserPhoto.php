<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPhoto extends Model
{
    protected $fillable = ['user_id', 'image', 'caption'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
