<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CompanySetting;
use App\Models\ContactInquiry;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = CompanySetting::current();

        return response()->json([
            'stats' => [
                'agents' => User::where('role', User::ROLE_AGENT)->count(),
                'users' => User::where('role', User::ROLE_USER)->count(),
                'pending_users' => User::where('role', User::ROLE_USER)->where('status', User::STATUS_PENDING)->count(),
                'packages' => \App\Models\Package::count(),
                'paid_bookings' => Booking::where('status', 'paid')->count(),
                'total_revenue' => Booking::where('status', 'paid')->sum('amount'),
                'pending_reviews' => Review::where('status', 'pending')->count(),
                'new_inquiries' => ContactInquiry::where('status', 'new')->count(),
            ],
            'company' => $settings,
        ]);
    }
}
