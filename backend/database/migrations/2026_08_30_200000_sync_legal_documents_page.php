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
            return;
        }

        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $defaults = SiteContentDefaults::header();
        $items = $english['company_menu']['items'] ?? [];
        $existingHrefs = collect($items)->pluck('href')->filter()->all();
        $legalHref = '/pages/legal-documents';

        if (! in_array($legalHref, $existingHrefs, true)) {
            $items[] = [
                'label' => 'Legal Documents',
                'href' => $legalHref,
                'visible' => true,
            ];
        }

        $english['company_menu'] = array_replace_recursive(
            $defaults['company_menu'],
            $english['company_menu'] ?? [],
            ['items' => $items]
        );

        $stored[Locale::DEFAULT] = $english;
        $record->content = $stored;
        $record->save();
    }

    private function syncPageSections(): void
    {
        $record = SiteContent::query()->where('key', 'page_sections')->first();
        $defaults = collect(SiteContentDefaults::pageSections()['items'] ?? [])->keyBy('slug');
        $legalDefault = $defaults->get('legal-documents');

        if (! $record || ! is_array($legalDefault)) {
            return;
        }

        $stored = Locale::normalizeStored($record->content ?? []);
        $english = $stored[Locale::DEFAULT] ?? [];
        $items = $english['items'] ?? [];
        $existingSlugs = collect($items)->pluck('slug')->filter()->all();

        if (! in_array('legal-documents', $existingSlugs, true)) {
            $items[] = $legalDefault;
        } else {
            foreach ($items as $index => $item) {
                if (($item['slug'] ?? null) !== 'legal-documents') {
                    continue;
                }

                if (($item['layout'] ?? null) !== 'legal' || empty($item['legal_documents'])) {
                    $items[$index] = array_merge($item, [
                        'layout' => 'legal',
                        'legal_documents' => $item['legal_documents'] ?? ($legalDefault['legal_documents'] ?? []),
                    ]);
                }

                break;
            }
        }

        $english['items'] = $items;
        $stored[Locale::DEFAULT] = $english;
        $record->content = $stored;
        $record->save();
    }
};
