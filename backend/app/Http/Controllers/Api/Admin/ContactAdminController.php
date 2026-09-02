<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactAdminController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            ContactInquiry::orderByDesc('created_at')->get()
        );
    }

    public function updateStatus(Request $request, ContactInquiry $inquiry): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:new,read,replied',
        ]);

        $inquiry->update($validated);

        return response()->json([
            'message' => 'Status updated.',
            'inquiry' => $inquiry->fresh(),
        ]);
    }
}
