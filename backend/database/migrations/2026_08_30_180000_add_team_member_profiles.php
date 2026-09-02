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

        $defaultMembers = collect($ourTeamDefault['team_members'] ?? [])->keyBy('id');
        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $items = $english['items'] ?? [];
        $updated = false;

        foreach ($items as $index => $item) {
            if (($item['slug'] ?? null) !== 'our-team') {
                continue;
            }

            $members = $item['team_members'] ?? [];

            foreach ($members as $memberIndex => $member) {
                $default = $defaultMembers->get($member['id'] ?? '');

                if (! is_array($default)) {
                    continue;
                }

                $members[$memberIndex] = array_merge($default, array_filter([
                    'photo' => $member['photo'] ?? null,
                    'social_links' => $member['social_links'] ?? null,
                ], fn ($value) => $value !== null));

                if (! empty($member['name'])) {
                    $members[$memberIndex]['name'] = $member['name'];
                }

                if (! empty($member['role'])) {
                    $members[$memberIndex]['role'] = $member['role'];
                }

                if (! empty($member['tagline'])) {
                    $members[$memberIndex]['tagline'] = $member['tagline'];
                }

                if (! empty($member['email'])) {
                    $members[$memberIndex]['email'] = $member['email'];
                }

                if (! empty($member['phone'])) {
                    $members[$memberIndex]['phone'] = $member['phone'];
                }

                if (! empty($member['whatsapp'])) {
                    $members[$memberIndex]['whatsapp'] = $member['whatsapp'];
                }

                if (! empty($member['biography'])) {
                    $members[$memberIndex]['biography'] = $member['biography'];
                }
            }

            $items[$index]['team_members'] = $members;
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
