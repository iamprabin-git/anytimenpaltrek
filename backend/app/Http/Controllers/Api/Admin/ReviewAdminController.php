<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->get());
    }

    public function approve(Review $review): JsonResponse
    {
        $review->update([
            'status' => 'approved',
            'is_featured' => true,
        ]);

        return response()->json([
            'message' => 'Review approved.',
            'review' => $review->fresh(),
        ]);
    }

    public function reject(Review $review): JsonResponse
    {
        $review->update([
            'status' => 'rejected',
            'is_featured' => false,
        ]);

        return response()->json([
            'message' => 'Review rejected.',
            'review' => $review->fresh(),
        ]);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json(['message' => 'Review deleted.']);
    }
}
