<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Support\ImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanySettingController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(CompanySetting::current());
    }

    public function update(Request $request): JsonResponse
    {
        $settings = CompanySetting::current();

        $validated = $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'logo_file' => ImageStorage::logoRules(),
            'remove_logo' => 'nullable|boolean',
            'address' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
            'dynamic_settings' => 'nullable',
        ]);

        if ($request->hasFile('logo_file')) {
            $this->deleteStoredLogo($settings);
            $settings->logo = ImageStorage::store($request->file('logo_file'), 'logos', [
                'max_width' => 800,
                'quality' => 90,
            ]);
        } elseif ($request->boolean('remove_logo')) {
            $this->deleteStoredLogo($settings);
            $settings->logo = null;
        }

        $dynamicSettings = $settings->dynamic_settings;
        if (array_key_exists('dynamic_settings', $validated)) {
            $incoming = $validated['dynamic_settings'];
            if (is_string($incoming)) {
                $dynamicSettings = json_decode($incoming, true);
            } elseif (is_array($incoming)) {
                $dynamicSettings = array_replace_recursive($settings->dynamic_settings ?? [], $incoming);
            }
        }

        $settings->fill([
            'company_name' => $validated['company_name'] ?? $settings->company_name,
            'address' => $validated['address'] ?? $settings->address,
            'phone' => $validated['phone'] ?? $settings->phone,
            'email' => $validated['email'] ?? $settings->email,
            'website' => $validated['website'] ?? $settings->website,
            'description' => $validated['description'] ?? $settings->description,
            'dynamic_settings' => $dynamicSettings,
        ]);

        $settings->save();

        return response()->json([
            'message' => 'Company settings updated successfully.',
            'settings' => $settings->fresh(),
        ]);
    }

    private function deleteStoredLogo(CompanySetting $settings): void
    {
        ImageStorage::delete($settings->logo);
    }
}
