<?php

use App\Models\SiteContent;
use App\Support\Locale;
use App\Support\SiteContentDefaults;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $record = SiteContent::query()->where('key', 'footer')->first();
        $defaults = SiteContentDefaults::footer();

        if (! $record) {
            return;
        }

        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $updated = false;

        if (empty($english['partner_badges'])) {
            $english['partner_badges'] = $defaults['partner_badges'] ?? [];
            $english['partner_title'] = $english['partner_title'] ?? ($defaults['partner_title'] ?? 'Find Us On');
            $updated = true;
        }

        if (! $updated) {
            return;
        }

        $stored[Locale::DEFAULT] = $english;
        $record->content = $stored;
        $record->save();
    }

    public function down(): void
    {
        // Non-destructive content sync; no rollback required.
    }
};
