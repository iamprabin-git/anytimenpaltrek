<?php

namespace Database\Seeders;

use App\Models\CompanySetting;
use App\Support\AgentPermissions;
use Illuminate\Database\Seeder;

class SyncAgentPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = CompanySetting::current();
        $dynamic = $settings->dynamic_settings ?? [];
        $stored = $dynamic['role_permissions'] ?? AgentPermissions::defaults();

        if (isset($stored['management_staff']) && ! isset($stored['manager'])) {
            $stored['manager'] = $stored['management_staff'];
            unset($stored['management_staff']);
        }

        foreach (AgentPermissions::defaults() as $role => $permissions) {
            $stored[$role] = array_values(array_unique(array_merge(
                $stored[$role] ?? [],
                $permissions
            )));
        }

        $stored[AgentPermissions::ROLE_DIRECTOR] = array_values(array_unique(array_merge(
            $stored[AgentPermissions::ROLE_DIRECTOR] ?? [],
            array_keys(AgentPermissions::catalog())
        )));

        $dynamic['role_permissions'] = $stored;

        if (empty($dynamic['payment_settings'])) {
            $dynamic['payment_settings'] = \App\Support\PaymentSettings::defaults();
        }

        $settings->update(['dynamic_settings' => $dynamic]);
    }
}
