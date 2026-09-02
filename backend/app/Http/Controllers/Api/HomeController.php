<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\CompanySetting;
use App\Models\SiteContent;
use App\Models\Destination;
use App\Models\HeroSlide;
use App\Models\Package;
use App\Models\Review;
use App\Support\SiteStats;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'company' => CompanySetting::current(),
            'hero_slides' => HeroSlide::active()->orderBy('sort_order')->get(),
            'featured_packages' => Package::active()
                ->orderBy('sort_order')
                ->limit(4)
                ->get(),
            'best_selling' => Package::active()
                ->where('is_featured', true)
                ->orderBy('sort_order')
                ->get(),
            'season_pick' => Package::active()
                ->where('is_season_pick', true)
                ->first(),
            'destinations' => Destination::orderBy('sort_order')->get(),
            'reviews' => Review::approved()->orderByDesc('created_at')->limit(6)->get(),
            'blog_posts' => BlogPost::published()
                ->orderByDesc('published_at')
                ->limit(3)
                ->get(),
            'stats' => SiteStats::forPublic(),
            'site_content' => SiteContent::merged(),
        ]);
    }
}
