<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\User;
use App\Support\ChangeApproval;
use App\Support\EmailNotifier;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->get());
    }

    public function approve(Request $request, Review $review): JsonResponse
    {
        return ChangeApproval::executeOrSubmit(
            $request,
            'reviews.approve',
            'review',
            $review->id,
            [],
            "Approve review by {$review->author_name}",
            function () use ($review) {
                $review->update(['status' => 'approved', 'is_featured' => true]);

                if ($review->user_id) {
                    $customer = User::find($review->user_id);
                    if ($customer) {
                        NotificationDispatcher::notifyUser(
                            $customer,
                            'Review approved',
                            'Your review has been approved and is now visible on our website.',
                            '/',
                            'review'
                        );
                        EmailNotifier::reviewApproved($customer, $review->fresh());
                    }
                }

                return response()->json(['message' => 'Review approved and published on the website.', 'review' => $review->fresh()]);
            }
        );
    }

    public function reject(Request $request, Review $review): JsonResponse
    {
        return ChangeApproval::executeOrSubmit(
            $request,
            'reviews.reject',
            'review',
            $review->id,
            [],
            "Reject review by {$review->author_name}",
            function () use ($review) {
                $review->update(['status' => 'rejected', 'is_featured' => false]);

                if ($review->user_id) {
                    $customer = User::find($review->user_id);
                    if ($customer) {
                        NotificationDispatcher::notifyUser(
                            $customer,
                            'Review not published',
                            'Your review was not approved for publication. Contact us if you have questions.',
                            '/account',
                            'review'
                        );
                        EmailNotifier::reviewRejected($customer, $review->fresh());
                    }
                }

                return response()->json(['message' => 'Review rejected.', 'review' => $review->fresh()]);
            }
        );
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        return ChangeApproval::executeOrSubmit(
            $request,
            'reviews.delete',
            'review',
            $review->id,
            [],
            "Delete review by {$review->author_name}",
            function () use ($review) {
                $review->delete();

                return response()->json(['message' => 'Review deleted.']);
            }
        );
    }
}
