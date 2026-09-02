<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserPhoto;
use App\Support\ImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $photos = UserPhoto::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (UserPhoto $photo) => [
                'id' => $photo->id,
                'caption' => $photo->caption,
                'image_url' => ImageStorage::url($photo->image),
                'created_at' => $photo->created_at,
            ]);

        return response()->json($photos);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'caption' => 'nullable|string|max:255',
            'photo_file' => ImageStorage::fileRules(true),
        ]);

        $photo = UserPhoto::create([
            'user_id' => $request->user()->id,
            'caption' => $validated['caption'] ?? null,
            'image' => ImageStorage::store($request->file('photo_file'), 'user-photos', [
                'max_width' => 1600,
                'quality' => 85,
            ]),
        ]);

        return response()->json([
            'message' => 'Photo uploaded successfully.',
            'photo' => [
                'id' => $photo->id,
                'caption' => $photo->caption,
                'image_url' => ImageStorage::url($photo->image),
                'created_at' => $photo->created_at,
            ],
        ], 201);
    }

    public function destroy(Request $request, UserPhoto $photo): JsonResponse
    {
        if ($photo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Photo not found.'], 404);
        }

        ImageStorage::delete($photo->image);
        $photo->delete();

        return response()->json(['message' => 'Photo deleted.']);
    }
}
