<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Support\ImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PackageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Package::query()->orderBy('sort_order');

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedData($request);
        $this->applyImage($request, $validated);
        $this->applyGallery($request, $validated);
        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['created_by'] = $request->user()->id;

        $package = Package::create($validated);

        return response()->json([
            'message' => 'Package created successfully.',
            'package' => $package,
        ], 201);
    }

    public function show(Package $package): JsonResponse
    {
        return response()->json($package);
    }

    public function update(Request $request, Package $package): JsonResponse
    {
        $validated = $this->validatedData($request, true);
        $this->applyImage($request, $validated, $package);
        $this->applyGallery($request, $validated, $package);

        if (isset($validated['title']) && $validated['title'] !== $package->title) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $package->id);
        }

        $package->update($validated);

        return response()->json([
            'message' => 'Package updated successfully.',
            'package' => $package->fresh(),
        ]);
    }

    public function destroy(Package $package): JsonResponse
    {
        ImageStorage::delete($package->getRawOriginal('image'));
        foreach ($package->gallery_images ?? [] as $path) {
            ImageStorage::delete($path);
        }
        $package->delete();

        return response()->json(['message' => 'Package deleted successfully.']);
    }

    private function applyGallery(Request $request, array &$validated, ?Package $package = null): void
    {
        $gallery = $package?->gallery_images ?? [];

        $removeIndices = collect($request->input('remove_gallery_indices', []))
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

        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                $gallery[] = ImageStorage::store($file, 'packages/gallery', [
                    'max_width' => 1600,
                    'quality' => 85,
                ]);
            }
        }

        $validated['gallery_images'] = array_values($gallery);
    }

    private function applyImage(Request $request, array &$validated, ?Package $package = null): void
    {
        if ($request->hasFile('image_file')) {
            ImageStorage::delete($package?->getRawOriginal('image'));
            $validated['image'] = ImageStorage::store($request->file('image_file'), 'packages', [
                'max_width' => 1600,
                'quality' => 85,
            ]);
        } elseif ($request->boolean('remove_image')) {
            ImageStorage::delete($package?->getRawOriginal('image'));
            $validated['image'] = null;
        }
    }

    private function validatedData(Request $request, bool $partial = false): array
    {
        $rules = [
            'title' => ($partial ? 'sometimes|' : '').'required|string|max:255',
            'category' => ($partial ? 'sometimes|' : '').'required|in:trekking,tour,adventure',
            'image_file' => ImageStorage::fileRules(),
            'gallery_files' => 'nullable|array',
            'gallery_files.*' => ImageStorage::fileRules(),
            'remove_gallery_indices' => 'nullable|array',
            'remove_gallery_indices.*' => 'integer|min:0',
            'remove_image' => 'nullable|boolean',
            'short_description' => 'nullable|string|max:1000',
            'description' => 'nullable|string',
            'duration_days' => ($partial ? 'sometimes|' : '').'required|integer|min:1',
            'rating' => 'nullable|integer|min:1|max:5',
            'price' => 'nullable|numeric|min:0',
            'price_label' => 'nullable|string|max:10',
            'difficulty' => 'nullable|string|max:50',
            'difficulty_score' => 'nullable|integer|min:1|max:5',
            'group_size_min' => 'nullable|integer|min:1|max:100',
            'group_size_max' => 'nullable|integer|min:1|max:100',
            'country' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:255',
            'max_altitude' => 'nullable|integer|min:0',
            'itinerary' => 'nullable|string',
            'availability_pricing' => 'nullable|string',
            'is_featured' => 'nullable|boolean',
            'is_season_pick' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ];

        $validated = $request->validate($rules);

        foreach (['is_featured', 'is_season_pick', 'is_active'] as $flag) {
            $validated[$flag] = $request->boolean($flag);
        }

        if ($request->has('remove_image')) {
            $validated['remove_image'] = $request->boolean('remove_image');
        }

        return $validated;
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $slug = Str::slug($title);
        $original = $slug;
        $counter = 1;

        while (
            Package::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $original.'-'.$counter++;
        }

        return $slug;
    }
}
