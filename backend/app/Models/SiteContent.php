<?php

namespace App\Models;

use App\Support\FooterImages;
use App\Support\Locale;
use App\Support\PageSectionImages;
use App\Support\SiteContentDefaults;
use App\Support\SiteStats;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = ['key', 'content'];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public static function merged(?string $locale = null): array
    {
        $locale = Locale::resolve($locale ?? Locale::current());
        $merged = [];

        foreach (SiteContentDefaults::keys() as $key) {
            $merged[$key] = static::getSection($key, $locale);
        }

        return $merged;
    }

    public static function getSection(string $key, ?string $locale = null): array
    {
        $locale = Locale::resolve($locale ?? Locale::current());
        $defaults = SiteContentDefaults::get($key);
        $record = static::query()->where('key', $key)->first();
        $stored = $record?->content ?? [];

        $merged = Locale::mergeLocalized($defaults, Locale::normalizeStored($stored), $locale);

        if ($key === 'page_sections') {
            $storedNormalized = Locale::normalizeStored($stored ?? []);
            $englishItems = Locale::extractLocalePayload($storedNormalized, Locale::DEFAULT)['items'] ?? [];
            $defaultItems = $defaults['items'] ?? [];
            $mergedItems = static::mergePageSectionItems($defaultItems, $englishItems);

            if ($locale !== Locale::DEFAULT) {
                $localeItems = Locale::extractLocalePayload($storedNormalized, $locale)['items'] ?? [];
                $mergedItems = static::mergePageSectionItems($mergedItems, $localeItems);
            }

            $merged['items'] = $mergedItems;
            $merged = PageSectionImages::transformSection($merged);
        }

        if ($key === 'footer') {
            $merged = FooterImages::transformFooter($merged);
        }

        return SiteStats::interpolate($merged);
    }

    /** @param  array<int, array<string, mixed>>  $defaults
     * @param  array<int, array<string, mixed>>  $stored
     * @return array<int, array<string, mixed>>
     */
    private static function mergePageSectionItems(array $defaults, array $stored): array
    {
        $keyFor = fn (array $item): string => (string) ($item['slug'] ?? $item['id'] ?? '');

        $defaultsBySlug = collect($defaults)->keyBy($keyFor);
        $storedBySlug = collect($stored)->keyBy($keyFor);

        $orderedSlugs = $storedBySlug->keys()
            ->merge($defaultsBySlug->keys())
            ->filter()
            ->unique()
            ->values();

        return $orderedSlugs
            ->map(function (string $slug) use ($defaultsBySlug, $storedBySlug) {
                $base = $defaultsBySlug->get($slug, []);
                $override = $storedBySlug->get($slug, []);

                return array_replace_recursive($base, $override);
            })
            ->values()
            ->all();
    }

    public static function updateSection(string $key, array $content, ?string $locale = null): self
    {
        $locale = Locale::resolve($locale ?? Locale::DEFAULT);
        $record = static::query()->firstOrNew(['key' => $key]);
        $stored = Locale::normalizeStored($record->content ?? []);
        $merged = array_replace_recursive($stored[$locale] ?? [], $content);

        if (isset($content['items']) && array_is_list($content['items'])) {
            $merged['items'] = $content['items'];
        }

        $stored[$locale] = $merged;
        $record->content = $stored;
        $record->save();

        return $record;
    }

    public static function seedDefaults(): void
    {
        foreach (SiteContentDefaults::all() as $key => $content) {
            static::query()->firstOrCreate(
                ['key' => $key],
                ['content' => [Locale::DEFAULT => $content]]
            );
        }
    }
}
