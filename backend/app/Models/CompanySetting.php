<?php

namespace App\Models;

use App\Support\AgentPermissions;
use App\Support\ImageStorage;
use App\Support\PaymentSettings;
use App\Support\ThemeSettings;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name', 'logo', 'address', 'phone', 'email', 'website',
        'description', 'dynamic_settings',
    ];

    protected $appends = ['logo_url'];

    protected $hidden = ['logo'];

    protected function casts(): array
    {
        return [
            'dynamic_settings' => 'array',
        ];
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo) {
            return null;
        }

        return ImageStorage::url($this->logo);
    }

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'company_name' => 'Anytime Nepal Trek',
            'phone' => '+977 9851086445',
            'email' => 'info@anytimenepaltrek.com',
            'address' => 'Kathmandu, Nepal',
            'website' => 'http://localhost:3000',
            'description' => 'Discover trekking, tours, and adventure holidays in Nepal.',
            'dynamic_settings' => [
                'tagline' => 'Tours and Trekking in Nepal',
                'support_hours' => '24/7 Support [Viber & WhatsApp]',
                'contact_whatsapp' => '+977 9851086445',
                'contact_viber' => '+977 9851086445',
                'currency' => 'USD',
                'registration_number' => '132626',
                'tourism_license' => '2083',
                'social_facebook' => '',
                'social_instagram' => '',
                'social_twitter' => '',
                'social_linkedin' => '',
                'social_youtube' => '',
                'social_wechat' => '',
                'social_line' => '',
                'theme' => ThemeSettings::defaults(),
                'role_permissions' => AgentPermissions::defaults(),
                'payment_settings' => PaymentSettings::defaults(),
                'staff_contacts' => [
                    [
                        'name' => 'Customer Support',
                        'role' => 'Reception',
                        'phone' => '+977 9851086445',
                        'email' => 'info@anytimenepaltrek.com',
                        'whatsapp' => '+977 9851086445',
                        'viber' => '+977 9851086445',
                    ],
                    [
                        'name' => 'Booking Manager',
                        'role' => 'Manager',
                        'phone' => '+977 9851086445',
                        'email' => 'manager@anytimenepaltrek.com',
                        'whatsapp' => '+977 9851086445',
                        'viber' => '+977 9851086445',
                    ],
                ],
                'contact_map_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56518.91106854746!2d85.291042!3d27.709031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a930872ef%3A0x8562511310ec9307!2sKathmandu%2C%20Nepal!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp',
                'sister_companies' => [
                    [
                        'id' => 'anytime-nepal',
                        'name' => 'Anytime Nepal Trek',
                        'description' => 'Trekking, tours, and adventure holidays across Nepal.',
                        'website' => 'http://localhost:3000',
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
            ],
        ]);
    }
}
