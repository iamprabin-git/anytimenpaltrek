<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->enum('category', ['trekking', 'tour', 'adventure']);
            $table->string('image')->nullable();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->unsignedSmallInteger('duration_days')->default(1);
            $table->unsignedTinyInteger('rating')->default(5);
            $table->decimal('price', 10, 2)->nullable();
            $table->string('price_label', 10)->default('USD');
            $table->string('difficulty')->nullable();
            $table->unsignedInteger('max_altitude')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_season_pick')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
