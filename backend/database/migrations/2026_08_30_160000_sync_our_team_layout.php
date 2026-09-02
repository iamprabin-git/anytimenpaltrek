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

            if (($item['layout'] ?? null) !== 'team' || empty($item['team_members'])) {
                $items[$index] = array_merge($item, [
                    'layout' => 'team',
                    'team_members' => $ourTeamDefault['team_members'] ?? [],
                    'heading' => $item['heading'] ?? ($ourTeamDefault['heading'] ?? null),
                    'paragraphs' => $item['paragraphs'] ?? ($ourTeamDefault['paragraphs'] ?? []),
                ]);
                unset($items[$index]['list_title'], $items[$index]['list_items']);
                $updated = true;
            }

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
