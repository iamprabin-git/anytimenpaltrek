<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CompanySettingSeeder::class,
            AdminSeeder::class,
            AgentSeeder::class,
            HeroSlideSeeder::class,
            PackageSeeder::class,
            DestinationSeeder::class,
            ReviewSeeder::class,
            BlogPostSeeder::class,
            SiteContentSeeder::class,
            SiteContentTranslationSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
