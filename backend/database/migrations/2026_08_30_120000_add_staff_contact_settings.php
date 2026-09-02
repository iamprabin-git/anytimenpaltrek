<?php

use App\Models\CompanySetting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $settings = CompanySetting::query()->first();
        if (! $settings) {
            return;
        }

        $dynamic = $settings->dynamic_settings ?? [];
        $phone = $settings->phone ?: '+977 9851086445';
        $email = $settings->email ?: 'info@anytimenepaltrek.com';

        $defaults = [
            'contact_whatsapp' => $phone,
            'contact_viber' => $phone,
            'staff_contacts' => [
                [
                    'name' => 'Customer Support',
                    'role' => 'Reception',
                    'phone' => $phone,
                    'email' => $email,
                    'whatsapp' => $phone,
                    'viber' => $phone,
                ],
                [
                    'name' => 'Booking Manager',
                    'role' => 'Manager',
                    'phone' => $phone,
                    'email' => 'manager@anytimenepaltrek.com',
                    'whatsapp' => $phone,
                    'viber' => $phone,
                ],
            ],
        ];

        $settings->update([
            'dynamic_settings' => array_replace_recursive($defaults, $dynamic),
        ]);
    }

    public function down(): void
    {
        $settings = CompanySetting::query()->first();
        if (! $settings) {
            return;
        }

        $dynamic = $settings->dynamic_settings ?? [];
        unset($dynamic['contact_whatsapp'], $dynamic['contact_viber'], $dynamic['staff_contacts']);

        $settings->update(['dynamic_settings' => $dynamic]);
    }
};
