<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\HeroSlide;
use App\Support\ImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HomeContentController extends Controller
{
    public function heroSlides(): JsonResponse
    {
        return response()->json(HeroSlide::query()->orderBy('sort_order')->get());
    }

    public function storeHeroSlide(Request $request): JsonResponse
    {
        $validated = $this->validateHeroSlide($request);
        $this->applyHeroImage($request, $validated);

        $slide = HeroSlide::create($validated);

        return response()->json(['message' => 'Hero slide created.', 'slide' => $slide], 201);
    }

    public function updateHeroSlide(Request $request, HeroSlide $heroSlide): JsonResponse
    {
        $validated = $this->validateHeroSlide($request, true);
        $this->applyHeroImage($request, $validated, $heroSlide);
        $heroSlide->update($validated);

        return response()->json(['message' => 'Hero slide updated.', 'slide' => $heroSlide->fresh()]);
    }

    public function destroyHeroSlide(HeroSlide $heroSlide): JsonResponse
    {
        ImageStorage::delete($heroSlide->getRawOriginal('image'));
        $heroSlide->delete();

        return response()->json(['message' => 'Hero slide deleted.']);
    }

    public function destinations(): JsonResponse
    {
        return response()->json(Destination::query()->orderBy('sort_order')->get());
    }

    public function storeDestination(Request $request): JsonResponse
    {
        $validated = $this->validateDestination($request);
        $this->applyDestinationImage($request, $validated);
        $validated['slug'] = $this->uniqueDestinationSlug($validated['name']);

        $destination = Destination::create($validated);

        return response()->json(['message' => 'Destination created.', 'destination' => $destination], 201);
    }

    public function updateDestination(Request $request, Destination $destination): JsonResponse
    {
        $validated = $this->validateDestination($request, true);
        $this->applyDestinationImage($request, $validated, $destination);

        if (isset($validated['name']) && $validated['name'] !== $destination->name) {
            $validated['slug'] = $this->uniqueDestinationSlug($validated['name'], $destination->id);
        }

        $destination->update($validated);

        return response()->json(['message' => 'Destination updated.', 'destination' => $destination->fresh()]);
    }

    public function destroyDestination(Destination $destination): JsonResponse
    {
        ImageStorage::delete($destination->getRawOriginal('image'));
        $destination->delete();

        return response()->json(['message' => 'Destination deleted.']);
    }

    private function validateHeroSlide(Request $request, bool $partial = false): array
    {
        $validated = $request->validate([
            'title' => ($partial ? 'sometimes|' : '').'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'cta_text' => 'nullable|string|max:120',
            'cta_link' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);

        return $validated;
    }

    private function validateDestination(Request $request, bool $partial = false): array
    {
        $validated = $request->validate([
            'name' => ($partial ? 'sometimes|' : '').'required|string|max:255',
            'temperature_c' => 'nullable|integer',
            'temperature_f' => 'nullable|integer',
            'attractions' => 'nullable|array',
            'attractions.*' => 'string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        if ($request->has('attractions_text')) {
            $validated['attractions'] = collect(explode("\n", (string) $request->input('attractions_text')))
                ->map(fn ($line) => trim($line))
                ->filter()
                ->values()
                ->all();
        }

        return $validated;
    }

    private function applyHeroImage(Request $request, array &$validated, ?HeroSlide $slide = null): void
    {
        if ($request->hasFile('image_file')) {
            ImageStorage::delete($slide?->getRawOriginal('image'));
            $validated['image'] = ImageStorage::store($request->file('image_file'), 'hero-slides', [
                'max_width' => 1920,
                'quality' => 85,
            ]);
        } elseif ($request->boolean('remove_image')) {
            ImageStorage::delete($slide?->getRawOriginal('image'));
            $validated['image'] = null;
        }
    }

    private function applyDestinationImage(Request $request, array &$validated, ?Destination $destination = null): void
    {
        if ($request->hasFile('image_file')) {
            ImageStorage::delete($destination?->getRawOriginal('image'));
            $validated['image'] = ImageStorage::store($request->file('image_file'), 'destinations', [
                'max_width' => 1200,
                'quality' => 85,
            ]);
        } elseif ($request->boolean('remove_image')) {
            ImageStorage::delete($destination?->getRawOriginal('image'));
            $validated['image'] = null;
        }
    }

    private function uniqueDestinationSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'destination';
        $slug = $base;
        $counter = 1;

        while (
            Destination::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }
}
