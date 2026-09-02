<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            [
                'author_name' => 'Clare Tone',
                'author_country' => 'United States',
                'rating' => 5,
                'content' => 'We are hikers and travelers from Colorado, USA and to trek in the Himalayas has been a lifelong dream of mine. The trip surpassed my expectations for many reasons which is why I\'m writing a 5-star review. From early planning to our final dinner together in Katmandu, the team took care of us as if we were special family friends.',
                'is_featured' => true,
                'status' => 'approved',
                'sort_order' => 1,
            ],
            [
                'author_name' => 'Marcos Rosas',
                'author_country' => 'USA',
                'rating' => 5,
                'content' => 'This was honestly my favorite trip I have ever done! Our guide was the best guide, interpreter, and friend. He guided through the wildlife, culture, and country sides. All flights, ground transportations, and accommodations were perfectly planned. It was a 10 out of 10 type of trip!',
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'author_name' => 'Carmen Asturiano',
                'author_country' => 'Mexico',
                'rating' => 5,
                'content' => 'In Kathmandu, we had a great time with our tour company. Mr. Raj took us to sites we would not have been able to visit without his assistance, and he did so on schedule and with the best service attitude possible. Reliable and highly recommended.',
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'author_name' => 'Ellyn Norris',
                'author_country' => 'USA',
                'rating' => 5,
                'content' => 'On a recent journey to Nepal, I had the pleasure of working with the team. They obtained our visa as promised and kept in touch with us throughout the process. We were also provided with transportation throughout. Everything went smoothly.',
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'author_name' => 'Justin Raynor',
                'author_country' => 'USA',
                'rating' => 5,
                'content' => 'The team was instrumental in making our two-week trip to Nepal absolutely beautiful and unforgettable. They assisted us with all of the necessary information and logistics including visas, local laws and culture, and transportation. Everything went off without a hitch.',
                'is_featured' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($reviews as $review) {
            Review::create($review);
        }
    }
}
