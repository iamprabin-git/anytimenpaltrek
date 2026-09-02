<?php

namespace App\Http\Middleware;

use App\Support\Locale;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->query('locale')
            ?? $request->header('X-Locale')
            ?? $this->parseAcceptLanguage($request->header('Accept-Language'));

        Locale::setCurrent($locale ?? Locale::DEFAULT);

        return $next($request);
    }

    private function parseAcceptLanguage(?string $header): ?string
    {
        if (! $header) {
            return null;
        }

        $part = explode(',', $header)[0];
        $part = explode(';', $part)[0];
        $part = str_replace('_', '-', trim($part));

        if (str_contains($part, '-')) {
            $part = explode('-', $part)[0];
        }

        return strtolower($part);
    }
}
