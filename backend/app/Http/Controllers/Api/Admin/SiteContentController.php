<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use App\Support\FooterImages;
use App\Support\Locale;
use App\Support\PageSectionImages;
use App\Support\SiteContentDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $locale = Locale::resolve($request->query('locale'));

        return response()->json([
            'locale' => $locale,
            'content' => SiteContent::merged($locale),
            'stored' => collect(SiteContentDefaults::keys())->mapWithKeys(function (string $key) {
                $record = SiteContent::query()->where('key', $key)->first();

                return [$key => $record?->content ?? []];
            }),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => 'nullable|string|max:5',
            'header' => 'sometimes|array',
            'footer' => 'sometimes|array',
            'home' => 'sometimes|array',
            'pages' => 'sometimes|array',
            'page_sections' => 'sometimes|array',
            'seo' => 'sometimes|array',
        ]);

        $locale = Locale::resolve($validated['locale'] ?? null);

        foreach ($validated as $key => $content) {
            if (in_array($key, SiteContentDefaults::keys(), true)) {
                SiteContent::updateSection($key, $content, $locale);
            }
        }

        return response()->json([
            'message' => 'Site content updated successfully.',
            'locale' => $locale,
            'content' => SiteContent::merged($locale),
        ]);
    }

    public function updateSection(Request $request, string $key): JsonResponse
    {
        if (! in_array($key, SiteContentDefaults::keys(), true)) {
            return response()->json(['message' => 'Content section not found.'], 404);
        }

        $validated = $request->validate([
            'locale' => 'nullable|string|max:5',
            'content' => 'required|array',
        ]);

        $locale = Locale::resolve($validated['locale'] ?? null);
        SiteContent::updateSection($key, $validated['content'], $locale);

        return response()->json([
            'message' => ucfirst($key).' content updated successfully.',
            'key' => $key,
            'locale' => $locale,
            'content' => SiteContent::getSection($key, $locale),
        ]);
    }

    public function updatePageSections(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => 'nullable|string|max:5',
            'content' => 'required|string',
        ]);

        $locale = Locale::resolve($validated['locale'] ?? null);
        $payload = json_decode($validated['content'], true);

        if (! is_array($payload)) {
            return response()->json(['message' => 'Invalid page sections payload.'], 422);
        }

        $items = $payload['items'] ?? [];

        // Use raw stored paths before public URL transformation.
        $storedRecord = SiteContent::query()->where('key', 'page_sections')->first();
        $storedLocalized = Locale::mergeLocalized(
            SiteContentDefaults::pageSections(),
            Locale::normalizeStored($storedRecord?->content ?? []),
            $locale
        );
        $storedItems = $storedLocalized['items'] ?? [];

        $processedItems = PageSectionImages::processItems($request, $items, $storedItems);
        PageSectionImages::deleteRemovedSections($storedItems, $processedItems);

        SiteContent::updateSection('page_sections', ['items' => $processedItems], $locale);

        return response()->json([
            'message' => 'Page sections saved successfully.',
            'locale' => $locale,
            'content' => SiteContent::merged($locale),
        ]);
    }

    public function updateFooter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'locale' => 'nullable|string|max:5',
            'content' => 'required|string',
        ]);

        $locale = Locale::resolve($validated['locale'] ?? null);
        $payload = json_decode($validated['content'], true);

        if (! is_array($payload)) {
            return response()->json(['message' => 'Invalid footer payload.'], 422);
        }

        $storedRecord = SiteContent::query()->where('key', 'footer')->first();
        $storedLocalized = Locale::mergeLocalized(
            SiteContentDefaults::footer(),
            Locale::normalizeStored($storedRecord?->content ?? []),
            $locale
        );
        $existingBadges = $storedLocalized['affiliation_badges'] ?? [];
        $incomingBadges = $payload['affiliation_badges'] ?? [];

        $payload['affiliation_badges'] = FooterImages::processAffiliationBadges(
            $request,
            $incomingBadges,
            $existingBadges
        );
        FooterImages::deleteRemovedBadgeImages($existingBadges, $payload['affiliation_badges']);

        $existingPartners = $storedLocalized['partner_badges'] ?? [];
        $incomingPartners = $payload['partner_badges'] ?? [];

        $payload['partner_badges'] = FooterImages::processPartnerBadges(
            $request,
            $incomingPartners,
            $existingPartners
        );
        FooterImages::deleteRemovedBadgeImages($existingPartners, $payload['partner_badges']);

        SiteContent::updateSection('footer', $payload, $locale);

        return response()->json([
            'message' => 'Footer content saved successfully.',
            'locale' => $locale,
            'content' => SiteContent::merged($locale),
        ]);
    }
}
