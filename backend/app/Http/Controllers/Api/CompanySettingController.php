<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\JsonResponse;

class CompanySettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(CompanySetting::current());
    }
}
