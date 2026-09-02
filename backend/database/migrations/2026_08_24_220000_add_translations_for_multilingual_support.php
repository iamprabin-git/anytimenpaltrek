<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('description');
        });

        Schema::table('destinations', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('description');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('content');
        });

        Schema::table('hero_slides', function (Blueprint $table) {
            $table->json('translations')->nullable()->after('cta_link');
        });

        foreach (DB::table('site_contents')->get() as $row) {
            $content = json_decode($row->content, true) ?: [];

            if (! isset($content['en'])) {
                DB::table('site_contents')
                    ->where('id', $row->id)
                    ->update(['content' => json_encode(['en' => $content])]);
            }
        }
    }

    public function down(): void
    {
        foreach (['packages', 'destinations', 'blog_posts', 'hero_slides'] as $tableName) {
            if (Schema::hasColumn($tableName, 'translations')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn('translations');
                });
            }
        }
    }
};
