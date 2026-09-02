<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Support\ProfileUpdater;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user()->toAuthArray());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = ProfileUpdater::validate($request, $request->user());
        $user = ProfileUpdater::update($request->user(), $request, $validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->toAuthArray(),
        ]);
    }
}
