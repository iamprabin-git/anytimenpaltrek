<?php

namespace App\Support;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogPostManager
{
    /** @return \Illuminate\Database\Eloquent\Collection<int, BlogPost> */
    public static function list()
    {
        return BlogPost::query()->orderByDesc('published_at')->orderByDesc('id')->get();
    }

    public static function create(Request $request): BlogPost
    {
        $validated = self::validate($request);
        self::applyImage($request, $validated);
        $validated['slug'] = self::uniqueSlug($validated['title']);

        return BlogPost::create($validated);
    }

    public static function update(Request $request, BlogPost $blogPost): BlogPost
    {
        $validated = self::validate($request, true);
        self::applyImage($request, $validated, $blogPost);

        if (isset($validated['title']) && $validated['title'] !== $blogPost->title) {
            $validated['slug'] = self::uniqueSlug($validated['title'], $blogPost->id);
        }

        $blogPost->update($validated);

        return $blogPost->fresh();
    }

    public static function delete(BlogPost $blogPost): void
    {
        ImageStorage::delete($blogPost->getRawOriginal('image'));
        $blogPost->delete();
    }

    /** @return array<string, mixed> */
    private static function validate(Request $request, bool $partial = false): array
    {
        $validated = $request->validate([
            'title' => ($partial ? 'sometimes|' : '').'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'published_at' => 'nullable|date',
            'is_published' => 'nullable|boolean',
        ]);

        $validated['is_published'] = $request->boolean('is_published', true);

        return $validated;
    }

    /** @param  array<string, mixed>  $validated */
    private static function applyImage(Request $request, array &$validated, ?BlogPost $post = null): void
    {
        if ($request->hasFile('image_file')) {
            ImageStorage::delete($post?->getRawOriginal('image'));
            $validated['image'] = ImageStorage::store($request->file('image_file'), 'blog', [
                'max_width' => 1600,
                'quality' => 85,
            ]);
        } elseif ($request->boolean('remove_image')) {
            ImageStorage::delete($post?->getRawOriginal('image'));
            $validated['image'] = null;
        }
    }

    private static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'blog-post';
        $slug = $base;
        $counter = 1;

        while (
            BlogPost::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }
}
