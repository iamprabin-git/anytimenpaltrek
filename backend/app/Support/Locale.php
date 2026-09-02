<?php

namespace App\Support;

class Locale
{
    public const DEFAULT = 'en';

    /** @return array<string, string> */
    public static function supported(): array
    {
        return [
            'en' => 'English',
            'zh' => '中文 (Chinese)',
            'vi' => 'Tiếng Việt (Vietnamese)',
            'fr' => 'Français (French)',
            'es' => 'Español (Spanish)',
            'de' => 'Deutsch (German)',
            'ja' => '日本語 (Japanese)',
            'ko' => '한국어 (Korean)',
            'hi' => 'हिन्दी (Hindi)',
            'th' => 'ไทย (Thai)',
            'ru' => 'Русский (Russian)',
            'ar' => 'العربية (Arabic)',
        ];
    }

    public static function codes(): array
    {
        return array_keys(self::supported());
    }

    public static function resolve(?string $locale): string
    {
        $locale = strtolower((string) $locale);

        return array_key_exists($locale, self::supported()) ? $locale : self::DEFAULT;
    }

    public static function current(): string
    {
        return app()->bound('locale')
            ? app('locale')
            : self::DEFAULT;
    }

    public static function setCurrent(string $locale): string
    {
        $locale = self::resolve($locale);
        app()->instance('locale', $locale);

        return $locale;
    }

    /**
     * Merge locale-specific overrides onto a base content array.
     *
     * @param  array<string, mixed>  $stored
     * @return array<string, mixed>
     */
    public static function mergeLocalized(array $base, array $stored, ?string $locale = null): array
    {
        $locale = self::resolve($locale ?? self::current());

        if ($locale === self::DEFAULT) {
            return array_replace_recursive($base, self::extractLocalePayload($stored, self::DEFAULT) ?: $stored);
        }

        $english = self::extractLocalePayload($stored, self::DEFAULT) ?: $stored;
        $mergedBase = array_replace_recursive($base, $english);
        $override = self::extractLocalePayload($stored, $locale);

        return $override
            ? array_replace_recursive($mergedBase, $override)
            : $mergedBase;
    }

    /**
     * @param  array<string, mixed>  $stored
     * @return array<string, mixed>|null
     */
    public static function extractLocalePayload(array $stored, string $locale): ?array
    {
        if (isset($stored[$locale]) && is_array($stored[$locale])) {
            return $stored[$locale];
        }

        if ($locale === self::DEFAULT && self::isFlatContent($stored)) {
            return $stored;
        }

        return null;
    }

    /** @param  array<string, mixed>  $stored */
    public static function isFlatContent(array $stored): bool
    {
        foreach (array_keys($stored) as $key) {
            if (in_array($key, self::codes(), true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $stored
     * @return array<string, mixed>
     */
    public static function normalizeStored(array $stored): array
    {
        if (self::isFlatContent($stored)) {
            return [self::DEFAULT => $stored];
        }

        return $stored;
    }

    /**
     * Apply translation map onto a model attribute array.
     *
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>|null  $translations
     * @param  list<string>  $fields
     * @return array<string, mixed>
     */
    public static function applyTranslations(array $attributes, ?array $translations, array $fields, ?string $locale = null): array
    {
        $locale = self::resolve($locale ?? self::current());

        if ($locale === self::DEFAULT || empty($translations[$locale]) || ! is_array($translations[$locale])) {
            return $attributes;
        }

        foreach ($fields as $field) {
            if (! empty($translations[$locale][$field])) {
                $attributes[$field] = $translations[$locale][$field];
            }
        }

        return $attributes;
    }
}
