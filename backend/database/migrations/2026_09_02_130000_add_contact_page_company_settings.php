<?php

use App\Models\CompanySetting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $settings = CompanySetting::query()->first();
        if (! $settings) {
            return;
        }

        $dynamic = $settings->dynamic_settings ?? [];
        $website = $settings->website ?: 'http://localhost:3000';

        $defaults = [
            'contact_map_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56518.91106854746!2d85.291042!3d27.709031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a930872ef%3A0x8562511310ec9307!2sKathmandu%2C%20Nepal!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp',
            'sister_companies' => [
                [
                    'id' => 'anytime-nepal',
                    'name' => 'Anytime Nepal Trek',
                    'description' => 'Trekking, tours, and adventure holidays across Nepal.',
                    'website' => $website,
                    'location' => 'Kathmandu, Nepal',
                    'visible' => true,
                ],
                [
                    'id' => 'anytime-tibet',
                    'name' => 'Anytime Tibet Travel',
                    'description' => 'Tailor-made Tibet tours, cultural journeys, and plateau adventures.',
                    'website' => '',
                    'location' => 'Lhasa, Tibet',
                    'visible' => true,
                ],
                [
                    'id' => 'anytime-bhutan',
                    'name' => 'Anytime Bhutan Tours',
                    'description' => 'Bhutan trekking, festival tours, and Himalayan cultural experiences.',
                    'website' => '',
                    'location' => 'Thimphu, Bhutan',
                    'visible' => true,
                ],
                [
                    'id' => 'anytime-india',
                    'name' => 'Anytime India Holidays',
                    'description' => 'North India tours, Ladakh expeditions, and heritage travel packages.',
                    'website' => '',
                    'location' => 'Delhi, India',
                    'visible' => true,
                ],
            ],
        ];

        $settings->update([
            'dynamic_settings' => array_replace_recursive($defaults, $dynamic),
        ]);
    }

    public function down(): void
    {
        $settings = CompanySetting::query()->first();
        if (! $settings) {
            return;
        }

        $dynamic = $settings->dynamic_settings ?? [];
        unset($dynamic['contact_map_embed_url'], $dynamic['sister_companies']);

        $settings->update(['dynamic_settings' => $dynamic]);
    }
};
