<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

class HeroSlideSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'title' => 'Discover the beauty of hidden nature, culture and adventure!',
                'subtitle' => 'to plan a new adventure',
                'image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
                'cta_text' => 'Helicopter Tour',
                'cta_link' => '/tours/himalaya-helicopter-tour',
                'sort_order' => 1,
            ],
            [
                'title' => 'Where you feel the diversity of nature, culture and adventure!',
                'subtitle' => 'Great Adventure Highlights Tours',
                'image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
                'cta_text' => 'View More',
                'cta_link' => '/tours',
                'sort_order' => 2,
            ],
        ];

        foreach ($slides as $slide) {
            HeroSlide::create($slide);
        }
    }
}
