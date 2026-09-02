<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RestoreDemoImagesSeeder extends Seeder
{
    public function run(): void
    {
        $heroImages = [
            1 => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
            2 => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
        ];

        foreach ($heroImages as $sortOrder => $image) {
            DB::table('hero_slides')
                ->whereNull('image')
                ->where('sort_order', $sortOrder)
                ->update(['image' => $image]);
        }

        $destinations = [
            'nepal' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'tibet' => 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
            'bhutan' => 'https://images.unsplash.com/photo-1526779255127-6a2568040ab9?w=800&q=80',
        ];

        foreach ($destinations as $slug => $image) {
            DB::table('destinations')
                ->where('slug', $slug)
                ->whereNull('image')
                ->update(['image' => $image]);
        }

        $packages = [
            'everest-base-camp-trek' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'annapurna-circuit-trek' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'ghorepani-poon-hill-trek' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'annapurna-base-camp-trek' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'upper-mustang-trek' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'everest-view-trek' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'everest-panorama-trek' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'annapurna-short-trek' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'himalaya-helicopter-tour' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            'nepal-photography-tour' => 'https://images.unsplash.com/photo-1526779255127-6a2568040ab9?w=800&q=80',
            'himalaya-highlights-tours' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
            'nepal-explore-tour' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'zipflyer-nepal-adventure' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            'white-water-rafting' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'paragliding-pokhara' => 'https://images.unsplash.com/photo-1526779255127-6a2568040ab9?w=800&q=80',
        ];

        foreach ($packages as $slug => $image) {
            DB::table('packages')
                ->where('slug', $slug)
                ->whereNull('image')
                ->update(['image' => $image]);
        }

        $blogPosts = [
            'zipline-adventure-nepal' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
            'complete-guide-zipline-nepal' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
            'zipflyer-nepal-ultimate-zipline' => 'https://images.unsplash.com/photo-1526779255127-6a2568040ab9?w=800&q=80',
        ];

        foreach ($blogPosts as $slug => $image) {
            DB::table('blog_posts')
                ->where('slug', $slug)
                ->whereNull('image')
                ->update(['image' => $image]);
        }
    }
}
