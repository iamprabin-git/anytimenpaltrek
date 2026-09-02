<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Support\BlogPostManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(BlogPostManager::list());
    }

    public function store(Request $request): JsonResponse
    {
        $post = BlogPostManager::create($request);

        return response()->json(['message' => 'Blog post created.', 'post' => $post], 201);
    }

    public function update(Request $request, BlogPost $blogPost): JsonResponse
    {
        $post = BlogPostManager::update($request, $blogPost);

        return response()->json(['message' => 'Blog post updated.', 'post' => $post]);
    }

    public function destroy(BlogPost $blogPost): JsonResponse
    {
        BlogPostManager::delete($blogPost);

        return response()->json(['message' => 'Blog post deleted.']);
    }
}
