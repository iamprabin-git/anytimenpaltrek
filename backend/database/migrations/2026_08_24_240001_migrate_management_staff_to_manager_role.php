<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('agent_role', 'management_staff')
            ->update(['agent_role' => 'manager']);

        $settings = DB::table('company_settings')->first();

        if (! $settings) {
            return;
        }

        $dynamic = json_decode($settings->dynamic_settings, true) ?? [];

        if (isset($dynamic['role_permissions']['management_staff'])) {
            $dynamic['role_permissions']['manager'] = $dynamic['role_permissions']['management_staff'];
            unset($dynamic['role_permissions']['management_staff']);
        }

        DB::table('company_settings')
            ->where('id', $settings->id)
            ->update(['dynamic_settings' => json_encode($dynamic)]);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('agent_role', 'manager')
            ->update(['agent_role' => 'management_staff']);
    }
};
