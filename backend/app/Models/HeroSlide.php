<?php

namespace App\Models;

use App\Models\Concerns\SerializesStoredImages;
use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    use SerializesStoredImages;
    protected $fillable = [
        'title', 'subtitle', 'image', 'cta_text', 'cta_link', 'sort_order', 'is_active', 'translations',
    ];

    protected array $translatedFields = ['title', 'subtitle', 'cta_text'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'translations' => 'array',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
