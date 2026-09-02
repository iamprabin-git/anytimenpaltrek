<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use App\Support\ChangeApproval;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ContactInquiry::orderByDesc('created_at')->get());
    }

    public function updateStatus(Request $request, ContactInquiry $inquiry): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:new,read,replied',
        ]);

        return ChangeApproval::executeOrSubmit(
            $request,
            'inquiries.update_status',
            'inquiry',
            $inquiry->id,
            $validated,
            "Update inquiry status to {$validated['status']} for {$inquiry->name}",
            function () use ($inquiry, $validated) {
                $inquiry->update($validated);

                return response()->json(['message' => 'Status updated.', 'inquiry' => $inquiry->fresh()]);
            }
        );
    }
}
