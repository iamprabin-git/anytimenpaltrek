<?php

namespace App\Models;

use App\Models\Concerns\SerializesStoredImages;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use SerializesStoredImages;
    protected $fillable = [
        'name', 'slug', 'image', 'temperature_c', 'temperature_f',
        'attractions', 'description', 'sort_order', 'translations',
    ];

    protected array $translatedFields = ['name', 'description'];

    protected function casts(): array
    {
        return [
            'attractions' => 'array',
            'translations' => 'array',
        ];
    }
}
