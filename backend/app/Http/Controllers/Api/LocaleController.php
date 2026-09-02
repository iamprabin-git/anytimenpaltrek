<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Locale;
use Illuminate\Http\JsonResponse;

class LocaleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'default' => Locale::DEFAULT,
            'current' => Locale::current(),
            'locales' => collect(Locale::supported())
                ->map(fn (string $label, string $code) => [
                    'code' => $code,
                    'label' => $label,
                ])
                ->values(),
        ]);
    }
}
