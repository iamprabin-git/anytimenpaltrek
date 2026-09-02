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
        $ourTeamDefault = $defaults->get('our-team');

        if (! $record || ! is_array($ourTeamDefault)) {
            return;
        }

        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $items = $english['items'] ?? [];
        $updated = false;

        foreach ($items as $index => $item) {
            if (($item['slug'] ?? null) !== 'our-team') {
                continue;
            }

            $items[$index] = array_merge($item, [
                'layout' => 'team',
                'heading' => $ourTeamDefault['heading'] ?? ($item['heading'] ?? null),
                'paragraphs' => $ourTeamDefault['paragraphs'] ?? ($item['paragraphs'] ?? []),
                'team_members' => $ourTeamDefault['team_members'] ?? [],
            ]);
            unset($items[$index]['list_title'], $items[$index]['list_items']);
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
