<?php

namespace App\Support;

use Illuminate\Http\Request;

class PageSectionImages
{
    public static function fieldKey(string $id): string
    {
        return preg_replace('/[^a-zA-Z0-9_-]/', '_', $id) ?: 'section';
    }

    /** @param  array<int, array<string, mixed>>  $items
     * @param  array<int, array<string, mixed>>  $existingItems
     * @return array<int, array<string, mixed>>
     */
    public static function processItems(Request $request, array $items, array $existingItems): array
    {
        $existingById = collect($existingItems)->keyBy('id');

        return array_values(array_map(function (array $item) use ($request, $existingById) {
            $key = self::fieldKey((string) ($item['id'] ?? ''));
            $existing = $existingById->get($item['id'] ?? '', []);

            $item['main_image'] = self::processMainImage($request, $key, $existing['main_image'] ?? null);
            $item['gallery_images'] = self::processGallery($request, $key, $existing['gallery_images'] ?? []);
            $item['team_members'] = self::processTeamMembers(
                $request,
                $key,
                $item['team_members'] ?? [],
                $existing['team_members'] ?? []
            );
            $item['legal_documents'] = self::processLegalDocuments(
                $request,
                $key,
                $item['legal_documents'] ?? [],
                $existing['legal_documents'] ?? []
            );

            return $item;
        }, $items));
    }

    /** @param  array<int, array<string, mixed>>  $existingItems
     * @param  array<int, array<string, mixed>>  $items
     */
    public static function deleteRemovedSections(array $existingItems, array $items): void
    {
        $incomingIds = collect($items)->pluck('id')->filter()->all();

        foreach ($existingItems as $existingItem) {
            if (in_array($existingItem['id'] ?? null, $incomingIds, true)) {
                continue;
            }

            self::deleteSectionImages($existingItem);
        }
    }

    /** @param  array<string, mixed>  $section */
    public static function deleteSectionImages(array $section): void
    {
        ImageStorage::delete($section['main_image'] ?? null);

        foreach ($section['gallery_images'] ?? [] as $path) {
            ImageStorage::delete($path);
        }

        foreach ($section['team_members'] ?? [] as $member) {
            ImageStorage::delete($member['photo'] ?? null);
        }

        foreach ($section['legal_documents'] ?? [] as $document) {
            ImageStorage::delete($document['image'] ?? null);
        }
    }

    /** @param  array<string, mixed>  $section */
    public static function transformSection(array $section): array
    {
        if (empty($section['items']) || ! is_array($section['items'])) {
            return $section;
        }

        $section['items'] = array_map(function (array $item) {
            if (! empty($item['main_image'])) {
                $item['main_image'] = ImageStorage::url($item['main_image']) ?? $item['main_image'];
            }

            if (! empty($item['gallery_images']) && is_array($item['gallery_images'])) {
                $item['gallery_images'] = array_values(array_filter(array_map(
                    fn ($path) => ImageStorage::url($path) ?? $path,
                    $item['gallery_images']
                )));
            }

            if (! empty($item['team_members']) && is_array($item['team_members'])) {
                $item['team_members'] = array_map(function (array $member) {
                    if (! empty($member['photo'])) {
                        $member['photo'] = ImageStorage::url($member['photo']) ?? $member['photo'];
                    }

                    return $member;
                }, $item['team_members']);
            }

            if (! empty($item['legal_documents']) && is_array($item['legal_documents'])) {
                $item['legal_documents'] = array_map(function (array $document) {
                    if (! empty($document['image'])) {
                        $document['image'] = ImageStorage::url($document['image']) ?? $document['image'];
                    }

                    return $document;
                }, $item['legal_documents']);
            }

            return $item;
        }, $section['items']);

        return $section;
    }

    private static function processMainImage(Request $request, string $key, ?string $existing): ?string
    {
        $fileKey = "main_image_file_{$key}";

        if ($request->hasFile($fileKey)) {
            ImageStorage::delete($existing);

            return ImageStorage::store($request->file($fileKey), 'page-sections', [
                'max_width' => 1600,
                'quality' => 85,
            ]);
        }

        if ($request->boolean("remove_main_image_{$key}")) {
            ImageStorage::delete($existing);

            return null;
        }

        return $existing;
    }

    /** @param  array<int, string>  $existing */
    private static function processGallery(Request $request, string $key, array $existing): array
    {
        $gallery = $existing;
        $fileKey = "gallery_files_{$key}";
        $removeKey = "remove_gallery_indices_{$key}";

        $removeIndices = collect($request->input($removeKey, []))
            ->map(fn ($index) => (int) $index)
            ->filter(fn ($index) => $index >= 0)
            ->sortDesc()
            ->values()
            ->all();

        foreach ($removeIndices as $index) {
            if (! isset($gallery[$index])) {
                continue;
            }

            ImageStorage::delete($gallery[$index]);
            array_splice($gallery, $index, 1);
        }

        if ($request->hasFile($fileKey)) {
            foreach ($request->file($fileKey) as $file) {
                $gallery[] = ImageStorage::store($file, 'page-sections/gallery', [
                    'max_width' => 1600,
                    'quality' => 85,
                ]);
            }
        }

        return array_values($gallery);
    }

    /** @param  array<int, array<string, mixed>>  $members
     * @param  array<int, array<string, mixed>>  $existingMembers
     * @return array<int, array<string, mixed>>
     */
    private static function processTeamMembers(Request $request, string $sectionKey, array $members, array $existingMembers): array
    {
        $existingById = collect($existingMembers)->keyBy('id');

        return array_values(array_map(function (array $member) use ($request, $sectionKey, $existingById) {
            $memberKey = self::fieldKey((string) ($member['id'] ?? ''));
            $existing = $existingById->get($member['id'] ?? '', []);
            $member['photo'] = self::processTeamPhoto(
                $request,
                $sectionKey,
                $memberKey,
                $existing['photo'] ?? null
            );

            return $member;
        }, $members));
    }

    private static function processTeamPhoto(Request $request, string $sectionKey, string $memberKey, ?string $existing): ?string
    {
        $fileKey = "team_photo_file_{$sectionKey}_{$memberKey}";

        if ($request->hasFile($fileKey)) {
            ImageStorage::delete($existing);

            return ImageStorage::store($request->file($fileKey), 'page-sections/team', [
                'max_width' => 1200,
                'quality' => 85,
            ]);
        }

        if ($request->boolean("remove_team_photo_{$sectionKey}_{$memberKey}")) {
            ImageStorage::delete($existing);

            return null;
        }

        return $existing;
    }

    /** @param  array<int, array<string, mixed>>  $documents
     * @param  array<int, array<string, mixed>>  $existingDocuments
     * @return array<int, array<string, mixed>>
     */
    private static function processLegalDocuments(Request $request, string $sectionKey, array $documents, array $existingDocuments): array
    {
        $existingById = collect($existingDocuments)->keyBy('id');

        return array_values(array_map(function (array $document) use ($request, $sectionKey, $existingById) {
            $documentKey = self::fieldKey((string) ($document['id'] ?? ''));
            $existing = $existingById->get($document['id'] ?? '', []);
            $document['image'] = self::processLegalDocumentImage(
                $request,
                $sectionKey,
                $documentKey,
                $existing['image'] ?? null
            );

            return $document;
        }, $documents));
    }

    private static function processLegalDocumentImage(Request $request, string $sectionKey, string $documentKey, ?string $existing): ?string
    {
        $fileKey = "legal_doc_file_{$sectionKey}_{$documentKey}";

        if ($request->hasFile($fileKey)) {
            ImageStorage::delete($existing);

            return ImageStorage::store($request->file($fileKey), 'page-sections/legal', [
                'max_width' => 1600,
                'quality' => 85,
            ]);
        }

        if ($request->boolean("remove_legal_doc_{$sectionKey}_{$documentKey}")) {
            ImageStorage::delete($existing);

            return null;
        }

        return $existing;
    }
}
