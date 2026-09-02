<?php

namespace App\Support;

use Illuminate\Http\Request;

class FooterImages
{
    /** @param  array<int, array<string, mixed>>  $badges
     * @param  array<int, array<string, mixed>>  $existingBadges
     * @return array<int, array<string, mixed>>
     */
    public static function processAffiliationBadges(Request $request, array $badges, array $existingBadges): array
    {
        return self::processBadges($request, $badges, $existingBadges, 'affiliation');
    }

    /** @param  array<int, array<string, mixed>>  $badges
     * @param  array<int, array<string, mixed>>  $existingBadges
     * @return array<int, array<string, mixed>>
     */
    public static function processPartnerBadges(Request $request, array $badges, array $existingBadges): array
    {
        return self::processBadges($request, $badges, $existingBadges, 'partner');
    }

    /** @param  array<string, mixed>  $footer */
    public static function transformFooter(array $footer): array
    {
        if (! empty($footer['affiliation_badges']) && is_array($footer['affiliation_badges'])) {
            $footer['affiliation_badges'] = self::transformBadges($footer['affiliation_badges']);
        }

        if (! empty($footer['partner_badges']) && is_array($footer['partner_badges'])) {
            $footer['partner_badges'] = self::transformBadges($footer['partner_badges']);
        }

        return $footer;
    }

    /** @param  array<int, array<string, mixed>>  $existingBadges
     * @param  array<int, array<string, mixed>>  $incomingBadges
     */
    public static function deleteRemovedBadgeImages(array $existingBadges, array $incomingBadges): void
    {
        $incomingIds = collect($incomingBadges)->pluck('id')->filter()->all();

        foreach ($existingBadges as $badge) {
            if (in_array($badge['id'] ?? null, $incomingIds, true)) {
                continue;
            }

            ImageStorage::delete($badge['image'] ?? null);
        }
    }

    /** @param  array<int, array<string, mixed>>  $badges
     * @param  array<int, array<string, mixed>>  $existingBadges
     * @return array<int, array<string, mixed>>
     */
    private static function processBadges(Request $request, array $badges, array $existingBadges, string $prefix): array
    {
        $existingById = collect($existingBadges)->keyBy('id');

        return array_values(array_map(function (array $badge) use ($request, $existingById, $prefix) {
            $badgeKey = self::fieldKey((string) ($badge['id'] ?? ''));
            $existing = $existingById->get($badge['id'] ?? '', []);
            $badge['image'] = self::processBadgeImage(
                $request,
                $prefix,
                $badgeKey,
                $existing['image'] ?? null
            );

            return $badge;
        }, $badges));
    }

    /** @param  array<int, array<string, mixed>>  $badges
     * @return array<int, array<string, mixed>>
     */
    private static function transformBadges(array $badges): array
    {
        return array_map(function (array $badge) {
            if (! empty($badge['image'])) {
                $badge['image'] = ImageStorage::url($badge['image']) ?? $badge['image'];
            }

            return $badge;
        }, $badges);
    }

    private static function processBadgeImage(Request $request, string $prefix, string $badgeKey, ?string $existing): ?string
    {
        $fileKey = "{$prefix}_image_file_{$badgeKey}";
        $removeKey = "remove_{$prefix}_image_{$badgeKey}";
        $folder = $prefix === 'partner' ? 'partners' : 'affiliations';

        if ($request->hasFile($fileKey)) {
            ImageStorage::delete($existing);

            return ImageStorage::store($request->file($fileKey), $folder, [
                'max_width' => 400,
                'quality' => 90,
            ]);
        }

        if ($request->boolean($removeKey)) {
            ImageStorage::delete($existing);

            return null;
        }

        return $existing;
    }

    public static function fieldKey(string $id): string
    {
        return preg_replace('/[^a-zA-Z0-9_-]/', '_', $id) ?: 'badge';
    }
}
