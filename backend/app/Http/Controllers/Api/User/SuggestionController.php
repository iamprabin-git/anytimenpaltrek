<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserSuggestion;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuggestionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $suggestions = UserSuggestion::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get(['id', 'subject', 'message', 'status', 'created_at']);

        return response()->json($suggestions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $suggestion = UserSuggestion::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        $user = $request->user();

        NotificationDispatcher::notifyAdmins(
            'Customer suggestion',
            "{$user->name} submitted a suggestion: {$validated['subject']}",
            '/agent/inquiries',
            'inquiry'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'inquiries.view',
            'Customer suggestion',
            "{$user->name} submitted a suggestion: {$validated['subject']}",
            '/agent/inquiries',
            'inquiry'
        );

        return response()->json([
            'message' => 'Thank you for your suggestion.',
            'suggestion' => $suggestion,
        ], 201);
    }
}
