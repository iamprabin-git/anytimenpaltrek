<?php

use Database\Seeders\SyncAgentPermissionsSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        (new SyncAgentPermissionsSeeder())->run();
    }

    public function down(): void
    {
        // Permissions are merged additively; no safe rollback.
    }
};
