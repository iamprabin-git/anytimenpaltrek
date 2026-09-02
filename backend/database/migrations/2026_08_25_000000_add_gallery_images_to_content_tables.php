<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->json('gallery_images')->nullable()->after('image');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->json('gallery_images')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('gallery_images');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn('gallery_images');
        });
    }
};
