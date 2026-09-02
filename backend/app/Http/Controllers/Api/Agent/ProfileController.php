<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Support\AgentPermissions;
use App\Support\ProfileUpdater;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            ...$user->toAuthArray(),
            'agent_role_label' => AgentPermissions::roleLabel($user->agent_role),
            'created_at' => $user->created_at,
        ]);
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
