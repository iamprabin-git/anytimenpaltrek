<?php

namespace App\Models;

use App\Models\Concerns\SerializesStoredImages;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    use SerializesStoredImages;
    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'image', 'gallery_images', 'published_at', 'is_published', 'translations',
    ];

    protected array $storedImageArrayFields = ['gallery_images'];

    protected array $translatedFields = ['title', 'excerpt', 'content'];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'gallery_images' => 'array',
            'is_published' => 'boolean',
            'translations' => 'array',
        ];
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
