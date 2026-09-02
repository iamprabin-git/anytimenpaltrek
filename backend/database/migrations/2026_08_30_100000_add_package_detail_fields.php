<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->string('country')->default('Nepal')->after('category');
            $table->string('region')->nullable()->after('country');
            $table->unsignedTinyInteger('difficulty_score')->nullable()->after('difficulty');
            $table->unsignedTinyInteger('group_size_min')->nullable()->after('difficulty_score');
            $table->unsignedTinyInteger('group_size_max')->nullable()->after('group_size_min');
            $table->text('itinerary')->nullable()->after('description');
            $table->text('availability_pricing')->nullable()->after('itinerary');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn([
                'country',
                'region',
                'difficulty_score',
                'group_size_min',
                'group_size_max',
                'itinerary',
                'availability_pricing',
            ]);
        });
    }
};
