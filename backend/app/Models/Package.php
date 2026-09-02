<?php

namespace App\Models;

use App\Models\Concerns\SerializesStoredImages;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use SerializesStoredImages;
    protected $fillable = [
        'title', 'slug', 'category', 'country', 'region', 'image', 'gallery_images', 'short_description', 'description', 'translations',
        'duration_days', 'rating', 'price', 'price_label', 'difficulty', 'difficulty_score', 'group_size_min', 'group_size_max',
        'max_altitude', 'itinerary', 'availability_pricing',
        'is_featured', 'is_season_pick', 'sort_order', 'is_active', 'created_by',
    ];

    protected array $storedImageArrayFields = ['gallery_images'];

    protected array $translatedFields = ['title', 'short_description', 'description', 'itinerary', 'availability_pricing', 'region'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'gallery_images' => 'array',
            'is_featured' => 'boolean',
            'is_season_pick' => 'boolean',
            'is_active' => 'boolean',
            'translations' => 'array',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
