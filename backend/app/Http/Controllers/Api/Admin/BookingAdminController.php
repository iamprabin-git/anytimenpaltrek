<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class BookingAdminController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Booking::with('package')->orderByDesc('created_at')->get()
        );
    }
}
