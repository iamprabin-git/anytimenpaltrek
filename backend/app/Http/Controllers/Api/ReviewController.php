<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Support\EmailNotifier;
use App\Support\ImageStorage;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Review::approved()->orderByDesc('created_at')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->isCustomer()) {
            return response()->json(['message' => 'Only logged-in customers can submit reviews.'], 403);
        }

        if (! $user->isActive()) {
            return response()->json(['message' => 'Your account must be approved before you can write a review.'], 403);
        }

        $validated = $request->validate([
            'author_country' => 'nullable|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string|min:20|max:5000',
            'avatar_file' => ImageStorage::fileRules(),
            'gallery_files' => 'nullable|array',
            'gallery_files.*' => ImageStorage::fileRules(),
        ]);

        $gallery = [];
        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                $gallery[] = ImageStorage::store($file, 'reviews/gallery', [
                    'max_width' => 1600,
                    'quality' => 85,
                ]);
            }
        }

        $authorAvatar = $user->getRawOriginal('avatar');
        if ($request->hasFile('avatar_file')) {
            $authorAvatar = ImageStorage::store($request->file('avatar_file'), 'reviews', [
                'max_width' => 800,
                'quality' => 85,
            ]);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'author_name' => $user->name,
            'author_country' => $validated['author_country'] ?? $user->country,
            'author_avatar' => $authorAvatar,
            'gallery_images' => $gallery ?: null,
            'rating' => $validated['rating'],
            'content' => $validated['content'],
            'status' => 'pending',
            'is_featured' => false,
        ]);

        NotificationDispatcher::notifyAdmins(
            'New customer review',
            "{$user->name} submitted a review awaiting approval.",
            '/agent/reviews',
            'review'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'reviews.view',
            'New customer review',
            "{$user->name} submitted a review awaiting approval.",
            '/agent/reviews',
            'review'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'reviews.approve',
            'Review awaiting approval',
            "{$user->name} submitted a review that needs manager approval.",
            '/agent/reviews',
            'review'
        );

        EmailNotifier::reviewSubmitted($user, $review);
        EmailNotifier::staffReviewSubmitted($user, $review);

        return response()->json([
            'message' => 'Thank you! Your review has been submitted and will appear after approval.',
            'review' => $review->fresh(),
        ], 201);
    }
}
