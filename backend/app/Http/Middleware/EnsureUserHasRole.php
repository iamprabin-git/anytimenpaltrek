<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (! $user->isActive()) {
            return response()->json(['message' => 'Your account is not active yet.'], 403);
        }

        return $next($request);
    }
}
