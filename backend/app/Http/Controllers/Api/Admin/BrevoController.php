<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Support\BrevoMarketing;
use App\Support\BrevoSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrevoController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'brevo' => BrevoSettings::status(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => 'sometimes|boolean',
            'list_id' => 'nullable|integer|min:1',
            'sender_email' => 'nullable|email|max:255',
            'sender_name' => 'nullable|string|max:255',
            'sync_contacts' => 'sometimes|boolean',
        ]);

        return response()->json([
            'message' => 'Brevo settings updated.',
            'brevo' => BrevoSettings::update($validated),
        ]);
    }

    public function test(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|email|max:255',
        ]);

        $user = $request->user();
        $email = $validated['email'] ?? $user->email;
        $name = $user->name;

        $result = BrevoMarketing::sendTestEmail($email, $name);

        return response()->json([
            'message' => "Test email sent to {$email} via Brevo.",
            'result' => $result,
            'brevo' => BrevoSettings::status(),
        ]);
    }
}
