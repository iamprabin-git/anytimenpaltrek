<?php

namespace Database\Seeders;

use App\Models\Destination;
use Illuminate\Database\Seeder;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $destinations = [
            [
                'name' => 'Nepal',
                'slug' => 'nepal',
                'image' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
                'temperature_c' => 25,
                'temperature_f' => 77,
                'attractions' => [
                    "World's Top 8 Highest Peak",
                    'Heavenly Nature',
                    'Adventure Activities',
                ],
                'description' => 'Home to Mount Everest and eight of the world\'s fourteen highest peaks, Nepal offers unparalleled trekking, rich culture, and warm hospitality.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Tibet',
                'slug' => 'tibet',
                'image' => 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
                'temperature_c' => 10,
                'temperature_f' => 50,
                'attractions' => [
                    'The Home of Mount Kailash',
                    'Heavenly Nature',
                    'Adventure Activities',
                ],
                'description' => 'Discover the roof of the world with sacred monasteries, vast plateaus, and the spiritual heart of Tibetan Buddhism.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Bhutan',
                'slug' => 'bhutan',
                'image' => 'https://images.unsplash.com/photo-1526779255127-6a2568040ab9?w=800&q=80',
                'temperature_c' => 24,
                'temperature_f' => 75,
                'attractions' => [
                    'Mt. Gangkhar Puensum Stand High',
                    'Heavenly Nature',
                    'Adventure Activities',
                ],
                'description' => 'The Land of the Thunder Dragon offers pristine landscapes, ancient dzongs, and a unique philosophy of Gross National Happiness.',
                'sort_order' => 3,
            ],
        ];

        foreach ($destinations as $destination) {
            Destination::create($destination);
        }
    }
}
