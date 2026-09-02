<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\WishlistItem;
use App\Support\ImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = WishlistItem::query()
            ->where('user_id', $request->user()->id)
            ->with('package:id,title,slug,image,category,price,price_label')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (WishlistItem $item) => [
                'id' => $item->id,
                'created_at' => $item->created_at,
                'package' => [
                    ...$item->package->toArray(),
                    'image_url' => ImageStorage::url($item->package->image),
                ],
            ]);

        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_slug' => 'required|string|exists:packages,slug',
        ]);

        $package = Package::active()->where('slug', $validated['package_slug'])->firstOrFail();

        $item = WishlistItem::firstOrCreate([
            'user_id' => $request->user()->id,
            'package_id' => $package->id,
        ]);

        $item->load('package:id,title,slug,image,category,price,price_label');

        return response()->json([
            'message' => 'Added to your wishlist.',
            'item' => [
                'id' => $item->id,
                'package' => [
                    ...$item->package->toArray(),
                    'image_url' => ImageStorage::url($item->package->image),
                ],
            ],
        ], 201);
    }

    public function destroy(Request $request, WishlistItem $wishlistItem): JsonResponse
    {
        if ($wishlistItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Wishlist item not found.'], 404);
        }

        $wishlistItem->delete();

        return response()->json(['message' => 'Removed from wishlist.']);
    }
}
