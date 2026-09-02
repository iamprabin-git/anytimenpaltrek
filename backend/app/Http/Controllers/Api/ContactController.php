<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        ContactInquiry::create([
            ...$validated,
            'user_id' => $request->user()?->id,
        ]);

        $subject = $validated['subject'] ?: 'New contact inquiry';
        NotificationDispatcher::notifyAdmins(
            'New contact inquiry',
            "{$validated['name']} sent a message: {$subject}",
            '/agent/inquiries',
            'inquiry'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'inquiries.view',
            'New contact inquiry',
            "{$validated['name']} sent a message: {$subject}",
            '/agent/inquiries',
            'inquiry'
        );

        return response()->json([
            'message' => 'Thank you! We will get back to you shortly.',
        ], 201);
    }
}
