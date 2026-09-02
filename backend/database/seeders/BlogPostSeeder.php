<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'title' => 'Zipline Adventure in Nepal: The Best Way to Experience the Beauty of the Himalayas',
                'slug' => 'zipline-adventure-nepal',
                'excerpt' => 'Discover why Nepal\'s zipline experiences offer the ultimate adrenaline rush with Himalayan views.',
                'content' => <<<'MD'
Nepal is home to some of the world's most spectacular zipline experiences. From Pokhara to Kathmandu, soaring above valleys with snow-capped peaks in the background is an adventure you will never forget.

## Why choose a Zipline Adventure in Nepal?

From the moment you step off the platform, you'll soar above lush valleys, rivers, and forests with the Himalayas stretching across the horizon. **[Pokhara](https://anytimenepaltrek.com/tours)** and the Annapurna region offer some of the most scenic zipline routes in the world.

### Highlights of Our Nepal Zipline Tours

- Unmatched Himalayan views and photo opportunities
- Certified guides and international safety standards
- Flexible packages for beginners and thrill seekers
- Easy day-trip options from Pokhara and Kathmandu

## Best Zipline Locations in Nepal

### ZipFlyer Pokhara

Experience one of the world's longest, steepest, and fastest ziplines with views of the Annapurna range and Phewa Lake.

### Kathmandu Valley Adventures

Shorter but equally thrilling routes are available near the capital for travelers with limited time.

## Planning Your Zipline Adventure

Before you book, confirm weight limits, weather conditions, and transport to the launch point. Most operators include safety gear, briefing, and photos.

### What to Wear

- Comfortable athletic clothing
- Closed-toe shoes with good grip
- Light jacket for windy mountain platforms

This guide covers everything you need to know about planning your zipline adventure in Nepal.
MD,
                'image' => 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
                ],
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => 'The Complete Guide to Zipline in Nepal',
                'slug' => 'complete-guide-zipline-nepal',
                'excerpt' => 'Everything you need to know before booking a zipline experience in Nepal.',
                'content' => 'From safety standards to the best locations and what to wear, our complete guide helps you prepare for an unforgettable zipline experience in the Himalayas.',
                'image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                'published_at' => now()->subDays(14),
            ],
            [
                'title' => 'ZipFlyer Nepal: The Ultimate Zipline Experience',
                'slug' => 'zipflyer-nepal-ultimate-zipline',
                'excerpt' => 'Experience the world\'s longest, steepest, and fastest zipline near Pokhara.',
                'content' => 'ZipFlyer Nepal offers an unparalleled zipline experience with speeds up to 140 km/h and breathtaking views of the Annapurna range. Learn about the experience, pricing, and how to book.',
                'image' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
                'published_at' => now()->subDays(21),
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::create($post);
        }
    }
}
