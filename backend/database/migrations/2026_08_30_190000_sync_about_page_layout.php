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
        $defaults = collect(SiteContentDefaults::pageSections()['items'] ?? [])->keyBy('slug');
        $aboutDefault = $defaults->get('about');

        if (! $record || ! is_array($aboutDefault)) {
            return;
        }

        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $items = $english['items'] ?? [];
        $updated = false;

        foreach ($items as $index => $item) {
            if (($item['slug'] ?? null) !== 'about') {
                continue;
            }

            $items[$index] = array_merge($item, [
                'layout' => 'about',
                'features' => $aboutDefault['features'] ?? [],
                'list_title' => $item['list_title'] ?? ($aboutDefault['list_title'] ?? null),
                'list_items' => $item['list_items'] ?? ($aboutDefault['list_items'] ?? []),
            ]);

            if (empty($item['paragraphs'])) {
                $items[$index]['paragraphs'] = $aboutDefault['paragraphs'] ?? [];
            }

            if (empty($item['heading'])) {
                $items[$index]['heading'] = $aboutDefault['heading'] ?? null;
            }

            $updated = true;

            break;
        }

        if (! $updated) {
            return;
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
