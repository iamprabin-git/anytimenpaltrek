<?php

namespace App\Models;

use App\Models\Concerns\SerializesStoredImages;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use SerializesStoredImages;

    protected function storedImageFields(): array
    {
        return ['author_avatar'];
    }
    protected array $storedImageArrayFields = ['gallery_images'];

    protected $fillable = [
        'author_name', 'author_country', 'author_avatar', 'gallery_images', 'rating',
        'content', 'status', 'is_featured', 'sort_order', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'gallery_images' => 'array',
        ];
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->approved();
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
