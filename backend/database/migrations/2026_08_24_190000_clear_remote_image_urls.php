<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->string('image')->nullable()->change();
        });

        $tables = [
            'packages' => 'image',
            'destinations' => 'image',
            'hero_slides' => 'image',
            'blog_posts' => 'image',
            'reviews' => 'author_avatar',
            'company_settings' => 'logo',
        ];

        foreach ($tables as $table => $column) {
            DB::table($table)
                ->where($column, 'like', 'http%')
                ->update([$column => null]);
        }
    }

    public function down(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->string('image')->nullable(false)->change();
        });
    }
};
