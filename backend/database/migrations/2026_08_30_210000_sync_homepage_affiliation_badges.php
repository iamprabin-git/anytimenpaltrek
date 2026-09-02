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
        $defaultBadges = collect($defaults['affiliation_badges'] ?? [])->keyBy('id');

        if (! $record) {
            return;
        }

        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $badges = $english['affiliation_badges'] ?? [];
        $updated = false;

        if ($badges === [] || collect($badges)->every(fn (array $badge) => empty($badge['id']))) {
            $english['affiliation_badges'] = $defaults['affiliation_badges'] ?? [];
            $updated = true;
        } else {
            $next = [];

            foreach ($badges as $badge) {
                if (! empty($badge['id']) && $defaultBadges->has($badge['id'])) {
                    $next[] = array_merge($defaultBadges->get($badge['id'], []), $badge);
                    $updated = true;

                    continue;
                }

                if (empty($badge['id'])) {
                    $badge['id'] = 'affiliation-'.md5((string) ($badge['label'] ?? uniqid()));
                    $updated = true;
                }

                $next[] = $badge;
            }

            if ($updated) {
                $english['affiliation_badges'] = $next;
            }
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
