<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Support\ChangeActionApplier;
use App\Support\ChangeApproval;
use App\Support\ImageStorage;
use App\Support\PaymentSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentSettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'payment_settings' => PaymentSettings::present(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'enabled' => 'nullable|boolean',
            'title' => 'nullable|string|max:255',
            'instructions' => 'nullable|string|max:2000',
            'bank_name' => 'nullable|string|max:255',
            'account_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'branch' => 'nullable|string|max:255',
            'swift_code' => 'nullable|string|max:50',
            'qr_file' => ImageStorage::fileRules(),
            'remove_qr' => 'nullable|boolean',
        ]);

        if (ChangeApproval::requiresApproval($request->user())) {
            $payload = ChangeActionApplier::stagePaymentQr($request);

            $description = $request->hasFile('qr_file') || $request->boolean('remove_qr')
                ? 'Update payment QR image'
                : 'Update payment bank account details';

            return ChangeApproval::pendingResponse(
                ChangeApproval::submit(
                    $request->user(),
                    'payment_settings.update',
                    'payment_settings',
                    null,
                    $payload,
                    $description
                )
            );
        }

        $input = $request->only([
            'title',
            'instructions',
            'bank_name',
            'account_name',
            'account_number',
            'branch',
            'swift_code',
        ]);

        if ($request->has('enabled')) {
            $input['enabled'] = $request->boolean('enabled');
        }

        $paymentSettings = PaymentSettings::update(
            $input,
            $request->file('qr_file'),
            $request->boolean('remove_qr')
        );

        $message = $request->hasFile('qr_file') || $request->boolean('remove_qr')
            ? 'QR image saved successfully.'
            : 'Bank account details saved successfully.';

        return response()->json([
            'message' => $message,
            'payment_settings' => $paymentSettings,
        ]);
    }
}
