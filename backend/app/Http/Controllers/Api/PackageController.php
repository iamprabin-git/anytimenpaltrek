<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Support\PackageAvailability;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Package::active()->orderBy('sort_order');

        if ($request->filled('category')) {
            $query->category($request->string('category'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        return response()->json($query->get());
    }

    public function show(string $slug): JsonResponse
    {
        $package = Package::active()->where('slug', $slug)->firstOrFail();

        return response()->json($package);
    }

    public function availability(Request $request, string $slug): JsonResponse
    {
        $package = Package::active()->where('slug', $slug)->firstOrFail();

        if ($request->filled('date')) {
            $validated = $request->validate([
                'date' => 'required|date',
            ]);

            return response()->json([
                'day' => PackageAvailability::forDate($package, $validated['date']),
                'package' => [
                    'slug' => $package->slug,
                    'duration_days' => (int) $package->duration_days,
                    'price' => $package->price,
                    'price_label' => $package->price_label,
                ],
            ]);
        }

        $validated = $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
        ]);

        return response()->json(
            PackageAvailability::forMonth($package, (int) $validated['year'], (int) $validated['month'])
        );
    }
}
