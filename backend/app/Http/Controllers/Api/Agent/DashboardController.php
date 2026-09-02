<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContactInquiry;
use App\Models\CrmCampaign;
use App\Models\Package;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'packages' => Package::count(),
                'pending_users' => User::where('role', User::ROLE_USER)->where('status', User::STATUS_PENDING)->count(),
                'active_users' => User::where('role', User::ROLE_USER)->where('status', User::STATUS_ACTIVE)->count(),
                'pending_reviews' => Review::where('status', 'pending')->count(),
                'new_inquiries' => ContactInquiry::where('status', 'new')->count(),
                'pending_bookings' => Booking::whereIn('status', [
                    Booking::STATUS_PENDING_APPROVAL,
                    Booking::STATUS_PENDING,
                ])->count(),
                'paid_bookings' => Booking::where('status', 'paid')->count(),
                'total_revenue' => Booking::where('status', 'paid')->sum('amount'),
                'active_customers' => User::where('role', User::ROLE_USER)->where('status', User::STATUS_ACTIVE)->count(),
                'loyalty_members' => User::where('role', User::ROLE_USER)->where('loyalty_points', '>', 0)->count(),
                'draft_campaigns' => CrmCampaign::where('status', CrmCampaign::STATUS_DRAFT)->count(),
            ],
        ]);
    }
}
