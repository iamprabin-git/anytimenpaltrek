<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use App\Support\SiteStats;
use Illuminate\Http\JsonResponse;

class SiteContentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'locale' => \App\Support\Locale::current(),
            'content' => SiteContent::merged(),
            'stats' => SiteStats::forPublic(),
        ]);
    }

    public function show(string $key): JsonResponse
    {
        if (! in_array($key, \App\Support\SiteContentDefaults::keys(), true)) {
            return response()->json(['message' => 'Content section not found.'], 404);
        }

        return response()->json([
            'key' => $key,
            'content' => SiteContent::getSection($key),
            'stats' => SiteStats::forPublic(),
        ]);
    }
}
