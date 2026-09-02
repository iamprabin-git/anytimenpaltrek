<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Support\PaymentSettings;
use Illuminate\Http\JsonResponse;

class PaymentSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $paymentSettings = PaymentSettings::presentForCustomer();

        return response()->json([
            'payment_settings' => $paymentSettings,
            'online_payment_enabled' => (bool) config('services.stripe.secret'),
        ]);
    }
}
