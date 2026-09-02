<?php

use App\Models\SiteContent;
use App\Support\Locale;
use App\Support\SiteContentDefaults;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $this->syncHeader();
        $this->syncPageSections();
    }

    public function down(): void
    {
        // Non-destructive content sync; no rollback required.
    }

    private function syncHeader(): void
    {
        $record = SiteContent::query()->where('key', 'header')->first();
        if (! $record) {
            SiteContent::seedDefaults();

            return;
        }

        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $defaults = SiteContentDefaults::header();
        $companyHrefs = collect($defaults['company_menu']['items'] ?? [])->pluck('href')->all();

        $nav = collect($english['nav'] ?? [])
            ->reject(fn (array $link) => in_array($link['href'] ?? '', $companyHrefs, true))
            ->values()
            ->all();

        $preferredOrder = ['/tours', '/trekking', '/adventure', '/blog', '/contact'];
        usort($nav, function (array $a, array $b) use ($preferredOrder) {
            $aIndex = array_search($a['href'] ?? '', $preferredOrder, true);
            $bIndex = array_search($b['href'] ?? '', $preferredOrder, true);
            $aIndex = $aIndex === false ? 99 : $aIndex;
            $bIndex = $bIndex === false ? 99 : $bIndex;

            return $aIndex <=> $bIndex;
        });

        $english['nav'] = $nav;
        $english['company_menu'] = array_replace_recursive(
            $defaults['company_menu'],
            $english['company_menu'] ?? []
        );

        $stored[Locale::DEFAULT] = $english;
        $record->content = $stored;
        $record->save();
    }

    private function syncPageSections(): void
    {
        $record = SiteContent::query()->where('key', 'page_sections')->first();
        $defaults = SiteContentDefaults::pageSections()['items'] ?? [];
        $requiredSlugs = ['our-team', 'our-vision', 'our-mission'];

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
};
