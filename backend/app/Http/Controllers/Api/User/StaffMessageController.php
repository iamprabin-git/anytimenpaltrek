<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use App\Support\EmailNotifier;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = ContactInquiry::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get(['id', 'subject', 'message', 'status', 'created_at']);

        return response()->json($messages);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $inquiry = ContactInquiry::create([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'unread',
            'user_id' => $user->id,
        ]);

        NotificationDispatcher::notifyAdmins(
            'Customer message to staff',
            "{$user->name} sent a message: {$validated['subject']}",
            '/agent/inquiries',
            'inquiry'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'inquiries.view',
            'Customer message to staff',
            "{$user->name} sent a message: {$validated['subject']}",
            '/agent/inquiries',
            'inquiry'
        );

        EmailNotifier::staffMessageSent($user, $validated['subject']);
        EmailNotifier::staffMessage($user->name, $validated['subject'], $validated['message']);

        return response()->json([
            'message' => 'Your message was sent to our staff team.',
            'inquiry' => $inquiry,
        ], 201);
    }
}
