<?php

use App\Models\SiteContent;
use App\Support\Locale;
use App\Support\SiteContentDefaults;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $record = SiteContent::query()->where('key', 'page_sections')->first();
        $defaults = SiteContentDefaults::pageSections()['items'] ?? [];
        $requiredSlugs = ['about', 'why-us', 'our-team', 'our-vision', 'our-mission'];

        if (! $record) {
            SiteContent::updateSection('page_sections', ['items' => $defaults]);

            return;
        }

        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $items = $english['items'] ?? [];
        $existingSlugs = collect($items)->pluck('slug')->filter()->all();

        foreach ($defaults as $defaultItem) {
            if (! in_array($defaultItem['slug'], $requiredSlugs, true)) {
                continue;
            }

            if (in_array($defaultItem['slug'], $existingSlugs, true)) {
                continue;
            }

            $items[] = $defaultItem;
        }

        $english['items'] = $items;
        $stored[Locale::DEFAULT] = $english;
        $record->content = $stored;
        $record->save();
    }

    public function down(): void
    {
        // Non-destructive content sync; no rollback required.
    }
};
