<?php

namespace App\Support;

class SiteContentDefaults
{
    public static function keys(): array
    {
        return ['header', 'footer', 'home', 'pages', 'page_sections', 'seo'];
    }

    public static function all(): array
    {
        $data = [];

        foreach (self::keys() as $key) {
            $data[$key] = self::get($key);
        }

        return $data;
    }

    public static function get(string $key): array
    {
        return match ($key) {
            'header' => self::header(),
            'footer' => self::footer(),
            'home' => self::home(),
            'pages' => self::pages(),
            'page_sections' => self::pageSections(),
            'seo' => self::seo(),
            default => [],
        };
    }

    public static function header(): array
    {
        return [
            'nav' => [
                ['label' => 'Tour', 'href' => '/tours', 'visible' => true],
                ['label' => 'Trekking', 'href' => '/trekking', 'visible' => true],
                ['label' => 'Adventure Holidays', 'href' => '/adventure', 'visible' => true],
                ['label' => 'Blog', 'href' => '/blog', 'visible' => true],
                ['label' => 'Contact Us', 'href' => '/contact', 'visible' => true],
            ],
            'company_menu' => [
                'label' => 'Company Info',
                'visible' => true,
                'items' => [
                    ['label' => 'About Us', 'href' => '/about', 'visible' => true],
                    ['label' => 'Our Team', 'href' => '/pages/our-team', 'visible' => true],
                    ['label' => 'Our Vision', 'href' => '/pages/our-vision', 'visible' => true],
                    ['label' => 'Our Mission', 'href' => '/pages/our-mission', 'visible' => true],
                    ['label' => 'Why Us', 'href' => '/why-us', 'visible' => true],
                    ['label' => 'Legal Documents', 'href' => '/pages/legal-documents', 'visible' => true],
                ],
            ],
            'login_label' => 'Login',
            'account_label' => 'My Account',
        ];
    }

    public static function footer(): array
    {
        return [
            'about_title' => 'Anytime Nepal Trek',
            'about_text' => 'Discover the beauty of hidden nature, culture and adventure in Nepal, Tibet, and Bhutan.',
            'quick_links_title' => 'Quick Links',
            'quick_links' => [
                ['label' => 'Payment', 'href' => '/account/payments', 'visible' => true],
                ['label' => 'About Us', 'href' => '/about', 'visible' => true],
                ['label' => 'Contact US', 'href' => '/contact', 'visible' => true],
                ['label' => 'Payment Info', 'href' => '/contact', 'visible' => true],
                ['label' => 'Privacy Policy', 'href' => '/why-us', 'visible' => true],
                ['label' => 'Nepal Airport', 'href' => 'https://www.tiairport.com/', 'visible' => true],
                ['label' => 'Nepal Embassy', 'href' => 'https://www.nepalembassy.org/', 'visible' => true],
                ['label' => 'Admin Login', 'href' => '/admin/login', 'visible' => true],
                ['label' => 'Agent Login', 'href' => '/agent/login', 'visible' => true],
            ],
            'activity_title' => 'Adventure Activity',
            'activity_links' => [
                ['label' => 'Tour', 'href' => '/tours', 'visible' => true],
                ['label' => 'Trekking', 'href' => '/trekking', 'visible' => true],
                ['label' => 'Adventure Holidays', 'href' => '/adventure', 'visible' => true],
            ],
            'affiliation_title' => 'Our Affiliation',
            'affiliation_badges' => [
                [
                    'id' => 'company-registrar',
                    'label' => 'Company Registrar',
                    'description' => 'Registered with: Company Registration Office Nepal',
                    'visible' => true,
                ],
                [
                    'id' => 'tourism-board',
                    'label' => 'Nepal Tourism Board',
                    'description' => 'Licensed by: Nepal Tourism Board and Department of Tourism',
                    'visible' => true,
                ],
                [
                    'id' => 'taan',
                    'label' => 'TAAN',
                    'description' => "Proud Member of Trekking Agency's Association of Nepal",
                    'visible' => true,
                ],
                [
                    'id' => 'nma',
                    'label' => 'NMA',
                    'description' => 'General Member of Nepal Mountaineering Association',
                    'visible' => true,
                ],
            ],
            'partner_title' => 'Find Us On',
            'partner_badges' => [
                [
                    'id' => 'tripadvisor',
                    'label' => 'TripAdvisor',
                    'href' => 'https://www.tripadvisor.com',
                    'visible' => true,
                ],
                [
                    'id' => 'booking-com',
                    'label' => 'Booking.com',
                    'href' => 'https://www.booking.com',
                    'visible' => true,
                ],
                [
                    'id' => 'google',
                    'label' => 'Google',
                    'href' => 'https://www.google.com/travel',
                    'visible' => true,
                ],
                [
                    'id' => 'viator',
                    'label' => 'Viator',
                    'href' => 'https://www.viator.com',
                    'visible' => true,
                ],
                [
                    'id' => 'expedia',
                    'label' => 'Expedia',
                    'href' => 'https://www.expedia.com',
                    'visible' => true,
                ],
                [
                    'id' => 'trustpilot',
                    'label' => 'Trustpilot',
                    'href' => 'https://www.trustpilot.com',
                    'visible' => true,
                ],
            ],
            'social_title' => 'Social Media',
            'payment_title' => 'Payment Method',
            'newsletter_placeholder' => 'Your Email address',
            'subscribe_label' => 'Subscribe',
            'designed_by' => 'Designed by:',
            'designed_by_link' => '',
            'contact_title' => 'Contact',
            'copyright' => '© Copyright {company_name} {year}. Company Registration no. {registration_number}. Tourism License no. {tourism_license}',
        ];
    }

    public static function home(): array
    {
        return [
            'featured' => [
                'title' => 'Where are you going?',
                'subtitle' => 'Pick your destination and discover your adventure.',
                'cta_text' => 'View All Treks',
                'cta_link' => '/trekking',
            ],
            'destinations' => [
                'title' => "Let's go travel",
                'subtitle' => "It's a big World out there, Go Explore",
                'attractions_label' => 'Tourist Attractions',
                'cta_text' => 'Know More →',
                'cta_link' => '/contact',
            ],
            'best_selling' => [
                'title' => 'Our Best Selling',
                'subtitle' => 'Where would you like to travel?',
            ],
            'season' => [
                'title' => 'Trip of the Season',
                'subtitle' => 'Lets make your best trip ever!',
                'cta_text' => 'Explore Package',
            ],
            'about' => [
                'title' => 'Travel Nepal Simplified',
                'paragraphs' => [
                    'We feel that Nepal is a place that should be experienced rather than just viewed on the road. We have over ten years of combined expertise guiding clients through the mountains, historical sites, jungle safaris, and adventures.',
                    'We will assist in the creation of magnificent trekking in Nepal, mountain biking, paddleboarding, and exploring the unknown adventure.',
                ],
                'bullets' => [
                    'Your next adventure starts now.',
                    'Confirm your booking.',
                    'Experience the Himalayas with expert guides.',
                ],
                'cta_text' => 'Read More',
                'cta_link' => '/about',
                'stat_label' => 'Years of Experience',
                'stat_note' => 'Trusted by travellers from around the world',
            ],
            'reviews' => [
                'title' => 'What our traveller say',
                'reviews_label' => 'Reviews',
                'travellers_label' => 'Happy Travellers',
                'cta_text' => 'Write a Review',
                'cta_link' => '/reviews/write',
            ],
            'blog' => [
                'title' => 'Travel Blog',
                'subtitle' => 'Discover new travel related information every week',
                'cta_text' => 'View All Posts',
                'cta_link' => '/blog',
            ],
        ];
    }

    public static function pages(): array
    {
        return [
            'about' => [
                'meta_title' => 'About Us',
                'meta_description' => 'Learn about Anytime Nepal Trek — over ten years of expertise guiding travellers through the Himalayas.',
                'hero_title' => 'About Us',
                'hero_subtitle' => 'Your trusted partner for trekking and tours in Nepal',
                'heading' => 'Travel Nepal Simplified',
                'paragraphs' => [
                    'We feel that Nepal is a place that should be experienced rather than just viewed on the road. We have over ten years of combined expertise guiding clients through the mountains, historical sites, jungle safaris, and adventures.',
                    'We will assist in the creation of magnificent trekking in Nepal, mountain biking, paddleboarding, and exploring the unknown adventure. Our team of experienced guides and support staff ensure every journey is safe, memorable, and tailored to your interests.',
                ],
                'list_title' => 'Why Choose Us?',
                'list_items' => [
                    'Licensed and registered tourism company',
                    'Experienced local guides with deep cultural knowledge',
                    'Personalized itineraries for every traveller',
                    '24/7 support before, during, and after your trip',
                    'Competitive pricing with no hidden costs',
                ],
            ],
            'contact' => [
                'meta_title' => 'Contact Us',
                'meta_description' => 'Get in touch with Anytime Nepal Trek for trekking, tours, and adventure bookings.',
                'hero_title' => 'Contact US',
                'hero_subtitle' => "We're here 24/7 to help plan your adventure",
                'sidebar_title' => 'Get in Touch',
                'phone_label' => 'Phone / WhatsApp / Viber',
                'email_label' => 'Email',
                'location_label' => 'Location',
                'hours_label' => 'Office Hours',
                'hours_text' => '24/7 Support Available',
                'form_title' => 'Send us a Message',
                'map_title' => 'Our Location',
                'map_subtitle' => 'Visit us in Kathmandu or find directions below',
                'social_title' => 'Follow Us',
                'social_subtitle' => 'Connect with us on social media for updates and travel inspiration',
                'sister_companies_title' => 'Our Sister Companies',
                'sister_companies_subtitle' => 'Explore our travel network across the Himalayas and beyond',
            ],
            'why_us' => [
                'meta_title' => 'Why Us',
                'meta_description' => 'Why choose Anytime Nepal Trek for your Himalayan adventure — safety, experience, and trusted service.',
                'hero_title' => 'Why Us ?',
                'hero_subtitle' => 'What makes us the right choice for your Nepal adventure',
                'features' => [
                    ['title' => 'Expert Local Guides', 'description' => 'Our guides have years of experience in the Himalayas and share deep knowledge of culture, wildlife, and trails.'],
                    ['title' => 'Safety & Security', 'description' => 'We prioritize your safety with proper acclimatization, quality equipment, and emergency protocols on every trek.'],
                    ['title' => 'Personalized Service', 'description' => 'From visa assistance to custom itineraries, we handle every detail so you can focus on the adventure.'],
                    ['title' => 'Trusted by Travellers', 'description' => '{happy_travellers}+ happy travellers and {reviews_count}+ reviews from clients around the world who recommend our services.'],
                    ['title' => 'Licensed Company', 'description' => 'Registered company with Tourism License no. 2083 and Company Registration no. 132626.'],
                    ['title' => '24/7 Support', 'description' => 'Reach us anytime via phone, WhatsApp, or Viber for planning, booking, or on-trip assistance.'],
                ],
            ],
            'trekking' => [
                'meta_title' => 'Trekking in Nepal | Anytime Nepal Trek',
                'meta_description' => 'Explore the best trekking packages in Nepal including Everest Base Camp, Annapurna Circuit and more.',
                'hero_title' => 'Trekking in Nepal',
                'hero_subtitle' => 'Discover world-class trekking routes through the Himalayas with expert guides and unforgettable views.',
            ],
            'tours' => [
                'meta_title' => 'Tours in Nepal | Anytime Nepal Trek',
                'meta_description' => 'Discover guided tours across Nepal including helicopter tours, photography tours, and cultural highlights.',
                'hero_title' => 'Tours in Nepal',
                'hero_subtitle' => 'Experience the best of Nepal with expertly curated tour packages.',
            ],
            'adventure' => [
                'meta_title' => 'Adventure Holidays | Anytime Nepal Trek',
                'meta_description' => 'Book adventure holidays in Nepal — zipline, rafting, paragliding and more.',
                'hero_title' => 'Adventure Holidays',
                'hero_subtitle' => 'Thrilling outdoor adventures for adrenaline seekers in the Himalayas.',
            ],
            'blog' => [
                'meta_title' => 'Travel Blog',
                'meta_description' => 'Discover new travel related information every week about trekking and tours in Nepal.',
                'hero_title' => 'Travel Blog',
                'hero_subtitle' => 'Discover new travel related information every week',
            ],
            'reviews_write' => [
                'meta_title' => 'Write a Review',
                'meta_description' => 'Share your experience trekking or touring with Anytime Nepal Trek.',
                'hero_title' => 'Write a Review',
                'hero_subtitle' => 'Tell us about your adventure with Anytime Nepal Trek',
            ],
        ];
    }

    public static function seo(): array
    {
        return [
            'site_name' => 'Anytime Nepal Trek',
            'title_template' => '%s | Anytime Nepal Trek',
            'default_description' => 'Discover trekking, tours, and adventure holidays in Nepal with Anytime Nepal Trek.',
            'site_url' => env('FRONTEND_URL', 'http://localhost:3000'),
            'keywords' => 'Nepal trekking, Nepal tours, Everest Base Camp, Annapurna trek, adventure holidays Nepal, Anytime Nepal Trek',
            'default_og_image' => '',
        ];
    }

    public static function pageSections(): array
    {
        return [
            'items' => [
                [
                    'id' => 'about',
                    'slug' => 'about',
                    'nav_label' => 'About Us',
                    'visible' => true,
                    'show_in_header' => false,
                    'show_in_footer' => false,
                    'show_in_company_menu' => false,
                    'layout' => 'about',
                    'meta_title' => 'About Us',
                    'meta_description' => 'Learn about Anytime Nepal Trek — over ten years of expertise guiding travellers through the Himalayas.',
                    'hero_title' => 'About Us',
                    'hero_subtitle' => 'Your trusted partner for trekking and tours in Nepal',
                    'heading' => 'Travel Nepal Simplified',
                    'paragraphs' => [
                        'We feel that Nepal is a place that should be experienced rather than just viewed from the road. With over ten years of combined expertise, we guide clients through the mountains, historical sites, jungle safaris, and adventures that define this incredible country.',
                        'We assist in the creation of magnificent trekking in Nepal, mountain biking, paddleboarding, and exploring the unknown. Our team of experienced guides and support staff ensure every journey is safe, memorable, and tailored to your interests.',
                    ],
                    'features' => [
                        ['title' => 'Authentic Experiences', 'description' => 'We design journeys that connect you with local culture, landscapes, and communities beyond the standard tourist trail.'],
                        ['title' => 'Expert Local Guides', 'description' => 'Our licensed guides bring deep route knowledge, safety awareness, and hospitality honed on Nepal\'s most demanding trails.'],
                        ['title' => 'End-to-End Support', 'description' => 'From permits and logistics to on-trip assistance, we handle the details so you can focus on the adventure.'],
                    ],
                    'list_title' => 'Why Choose Us?',
                    'list_items' => [
                        'Licensed and registered tourism company',
                        'Experienced local guides with deep cultural knowledge',
                        'Personalized itineraries for every traveller',
                        '24/7 support before, during, and after your trip',
                        'Competitive pricing with no hidden costs',
                    ],
                ],
                [
                    'id' => 'why-us',
                    'slug' => 'why-us',
                    'nav_label' => 'Why Us',
                    'visible' => true,
                    'show_in_header' => false,
                    'show_in_footer' => false,
                    'show_in_company_menu' => false,
                    'layout' => 'features',
                    'meta_title' => 'Why Us',
                    'meta_description' => 'Why choose Anytime Nepal Trek for your Himalayan adventure — safety, experience, and trusted service.',
                    'hero_title' => 'Why Us ?',
                    'hero_subtitle' => 'What makes us the right choice for your Nepal adventure',
                    'features' => [
                        ['title' => 'Expert Local Guides', 'description' => 'Our guides have years of experience in the Himalayas and share deep knowledge of culture, wildlife, and trails.'],
                        ['title' => 'Safety & Security', 'description' => 'We prioritize your safety with proper acclimatization, quality equipment, and emergency protocols on every trek.'],
                        ['title' => 'Personalized Service', 'description' => 'From visa assistance to custom itineraries, we handle every detail so you can focus on the adventure.'],
                        ['title' => 'Trusted by Travellers', 'description' => '{happy_travellers}+ happy travellers and {reviews_count}+ reviews from clients around the world who recommend our services.'],
                        ['title' => 'Licensed Company', 'description' => 'Registered company with Tourism License no. 2083 and Company Registration no. 132626.'],
                        ['title' => '24/7 Support', 'description' => 'Reach us anytime via phone, WhatsApp, or Viber for planning, booking, or on-trip assistance.'],
                    ],
                ],
                [
                    'id' => 'privacy-policy',
                    'slug' => 'privacy-policy',
                    'nav_label' => 'Privacy Policy',
                    'visible' => true,
                    'show_in_header' => false,
                    'show_in_footer' => true,
                    'meta_title' => 'Privacy Policy',
                    'meta_description' => 'Privacy policy for Anytime Nepal Trek website and services.',
                    'hero_title' => 'Privacy Policy',
                    'hero_subtitle' => 'How we collect, use, and protect your information',
                    'heading' => 'Your privacy matters',
                    'paragraphs' => [
                        'We respect your privacy and are committed to protecting the personal information you share with us when booking tours, treks, or contacting our team.',
                        'We only collect information needed to provide our services, improve your experience, and communicate with you about your travel plans.',
                    ],
                    'list_title' => 'What we may collect',
                    'list_items' => [
                        'Name, email, phone number, and country',
                        'Booking and payment-related details',
                        'Messages sent through our contact forms',
                    ],
                ],
                [
                    'id' => 'terms-and-conditions',
                    'slug' => 'terms-and-conditions',
                    'nav_label' => 'Terms & Conditions',
                    'visible' => true,
                    'show_in_header' => false,
                    'show_in_footer' => true,
                    'meta_title' => 'Terms & Conditions',
                    'meta_description' => 'Terms and conditions for booking with Anytime Nepal Trek.',
                    'hero_title' => 'Terms & Conditions',
                    'hero_subtitle' => 'Important information about bookings and travel services',
                    'heading' => 'Booking terms',
                    'paragraphs' => [
                        'By booking with Anytime Nepal Trek, you agree to our booking policies, cancellation terms, and travel requirements for your selected package.',
                    ],
                ],
                [
                    'id' => 'our-team',
                    'slug' => 'our-team',
                    'nav_label' => 'Our Team',
                    'visible' => true,
                    'show_in_header' => false,
                    'show_in_footer' => false,
                    'show_in_company_menu' => false,
                    'layout' => 'team',
                    'meta_title' => 'Our Team',
                    'meta_description' => 'Meet the guides, planners, and support staff behind Anytime Nepal Trek.',
                    'hero_title' => 'Our Team',
                    'hero_subtitle' => 'Experienced people dedicated to safe and memorable journeys',
                    'heading' => 'People who make every trip possible',
                    'paragraphs' => [
                        'Our team brings together licensed guides, trek leaders, travel planners, and customer support staff who know Nepal from the trails to the cities.',
                    ],
                    'team_members' => [
                        [
                            'id' => 'shreeram-thapaliya',
                            'slug' => 'shreeram-thapaliya',
                            'name' => 'Shreeram Thapaliya',
                            'role' => 'Founder/CEO & Trek/Tour Guide',
                            'tagline' => '14 Years of Experience',
                            'email' => 'info@anytimenepaltrek.com',
                            'phone' => '+977-9841234567',
                            'whatsapp' => '+9779841234567',
                            'biography' => "Shreeram Thapaliya founded Anytime Nepal Trek with a passion for sharing the Himalayas with travellers from around the world.\nAs a licensed trek and tour guide, he leads expeditions across Nepal and ensures every journey is safe, well planned, and culturally rich.\nHis experience on major trekking routes and commitment to honest service have made him a trusted name among returning clients.",
                            'visible' => true,
                            'social_links' => [
                                ['platform' => 'facebook', 'label' => 'Facebook', 'href' => ''],
                                ['platform' => 'instagram', 'label' => 'Instagram', 'href' => ''],
                            ],
                        ],
                        [
                            'id' => 'shreejana-upreti',
                            'slug' => 'shreejana-upreti',
                            'name' => 'Shreejana Upreti',
                            'role' => 'Operation Head/Manager/Tour Guide',
                            'tagline' => '10 Years of Experience',
                            'email' => 'operations@anytimenepaltrek.com',
                            'phone' => '+977-9847654321',
                            'whatsapp' => '+9779847654321',
                            'biography' => "Shreejana Upreti coordinates daily operations, bookings, and on-trip logistics for Anytime Nepal Trek.\nShe works closely with guides, porters, and partners to keep every itinerary running smoothly from arrival to departure.\nHer background as a tour guide helps her understand traveller needs and deliver responsive support at every stage.",
                            'visible' => true,
                            'social_links' => [
                                ['platform' => 'facebook', 'label' => 'Facebook', 'href' => ''],
                                ['platform' => 'linkedin', 'label' => 'LinkedIn', 'href' => ''],
                            ],
                        ],
                        [
                            'id' => 'brian-bohne',
                            'slug' => 'brian-bohne',
                            'name' => 'Brian Bohne',
                            'role' => 'Advisor/USA Representative',
                            'tagline' => 'Adventure Enthusiastic',
                            'email' => 'usa@anytimenepaltrek.com',
                            'phone' => '+1-555-010-2000',
                            'whatsapp' => '',
                            'biography' => "Brian Bohne supports travellers from the United States with planning advice, timing, and pre-departure questions.\nAs an adventure enthusiast and long-time Nepal visitor, he helps clients choose the right trek or tour for their fitness level and schedule.\nHe acts as a friendly point of contact for North American guests before they travel to Nepal.",
                            'visible' => true,
                            'social_links' => [
                                ['platform' => 'linkedin', 'label' => 'LinkedIn', 'href' => ''],
                            ],
                        ],
                        [
                            'id' => 'frederic-bien',
                            'slug' => 'frederic-bien',
                            'name' => 'Frédéric Bien',
                            'role' => 'Advisor and Europe Contact',
                            'tagline' => 'Adventure Enthusiastic',
                            'email' => 'europe@anytimenepaltrek.com',
                            'phone' => '+33-1-23-45-67-89',
                            'whatsapp' => '',
                            'biography' => "Frédéric Bien represents Anytime Nepal Trek across Europe and assists French- and English-speaking travellers.\nHe advises on seasonal conditions, visa preparation, and custom itineraries for trekking and cultural tours.\nHis enthusiasm for mountain travel helps guests feel confident before embarking on their Himalayan adventure.",
                            'visible' => true,
                            'social_links' => [],
                        ],
                    ],
                ],
                [
                    'id' => 'our-vision',
                    'slug' => 'our-vision',
                    'nav_label' => 'Our Vision',
                    'visible' => true,
                    'show_in_header' => false,
                    'show_in_footer' => false,
                    'show_in_company_menu' => true,
                    'layout' => 'vision',
                    'meta_title' => 'Our Vision',
                    'meta_description' => 'Our vision for responsible travel and unforgettable Himalayan experiences.',
                    'hero_title' => 'Our Vision',
                    'hero_subtitle' => 'Connecting travellers with the Himalayas responsibly',
                    'heading' => 'Where we are headed',
                    'paragraphs' => [
                        'We envision a future where every traveller experiences Nepal with confidence, respect for local communities, and minimal impact on the environment.',
                        'Our goal is to become a trusted name for personalised trekking and tours that combine adventure, culture, and professional service.',
                        'We believe meaningful travel should uplift local livelihoods, preserve mountain ecosystems, and leave guests with stories they carry for a lifetime.',
                    ],
                    'list_title' => 'What success looks like',
                    'list_items' => [
                        'Recognised as a leading responsible tourism company in Nepal',
                        'Strong partnerships with local guides, porters, and community suppliers',
                        'Consistent guest experiences built on safety, transparency, and care',
                        'Growth that balances adventure with environmental stewardship',
                    ],
                    'features' => [
                        [
                            'title' => 'Responsible Tourism',
                            'description' => 'We promote low-impact travel practices that protect trails, wildlife, and mountain communities for future generations.',
                        ],
                        [
                            'title' => 'Trusted Himalayan Partner',
                            'description' => 'We aim to be the first name travellers recommend for safe, well-organised, and honestly priced journeys in Nepal.',
                        ],
                        [
                            'title' => 'Cultural Connection',
                            'description' => 'We create opportunities for authentic cultural exchange that respect traditions and benefit local people directly.',
                        ],
                        [
                            'title' => 'Accessible Adventure',
                            'description' => 'We want world-class trekking and touring to feel approachable, well guided, and thoughtfully planned for every guest.',
                        ],
                    ],
                ],
                [
                    'id' => 'our-mission',
                    'slug' => 'our-mission',
                    'nav_label' => 'Our Mission',
                    'visible' => true,
                    'show_in_header' => false,
                    'show_in_footer' => false,
                    'show_in_company_menu' => true,
                    'layout' => 'mission',
                    'meta_title' => 'Our Mission',
                    'meta_description' => 'Our mission to deliver safe, well-organised, and authentic travel experiences in Nepal.',
                    'hero_title' => 'Our Mission',
                    'hero_subtitle' => 'Safe journeys, honest service, and meaningful adventures',
                    'heading' => 'What we work for every day',
                    'paragraphs' => [
                        'We plan and deliver treks, tours, and adventure holidays with clear communication, fair pricing, and attention to every detail of your trip.',
                        'We support local guides and communities while helping travellers explore Nepal with comfort, safety, and genuine hospitality.',
                        'Every itinerary is handled with professional care — from route planning and permits to on-trip support and post-journey follow-up.',
                    ],
                    'list_title' => 'Our commitments',
                    'list_items' => [
                        'Transparent booking, pricing, and payment processes',
                        'Safety-first operations with licensed guides on every route',
                        'Personalised support from inquiry through departure and return',
                        'Fair treatment and reliable opportunities for local teams',
                        'Honest advice that matches your fitness, budget, and travel goals',
                    ],
                    'features' => [
                        [
                            'title' => 'Safety First',
                            'description' => 'We use proven routes, experienced guides, and careful preparation to keep every expedition secure and well managed.',
                        ],
                        [
                            'title' => 'Honest Communication',
                            'description' => 'We provide realistic timelines, clear inclusions, and responsive answers so you always know what to expect.',
                        ],
                        [
                            'title' => 'Local Partnership',
                            'description' => 'We work with guides, porters, and suppliers who know the terrain and represent the communities we visit.',
                        ],
                        [
                            'title' => 'Personalised Journeys',
                            'description' => 'We tailor treks and tours around your dates, pace, interests, and travel style instead of forcing one-size-fits-all packages.',
                        ],
                    ],
                ],
                [
                    'id' => 'legal-documents',
                    'slug' => 'legal-documents',
                    'nav_label' => 'Legal Documents',
                    'visible' => true,
                    'show_in_header' => false,
                    'show_in_footer' => false,
                    'show_in_company_menu' => false,
                    'layout' => 'legal',
                    'meta_title' => 'Legal Documents',
                    'meta_description' => 'Official registrations, licenses, and certifications for Anytime Nepal Trek.',
                    'hero_title' => 'Legal Documents',
                    'hero_subtitle' => 'Registered company licenses and government certifications',
                    'legal_documents' => [
                        [
                            'id' => 'company-registrar',
                            'title' => 'Office of Company Registrar',
                            'visible' => true,
                        ],
                        [
                            'id' => 'ministry-of-tourism',
                            'title' => 'Ministry of Tourism of Nepal',
                            'visible' => true,
                        ],
                        [
                            'id' => 'income-tax-office',
                            'title' => 'Income Tax Office of Nepal',
                            'visible' => true,
                        ],
                        [
                            'id' => 'nepal-rastra-bank',
                            'title' => 'Nepal Rastra Bank',
                            'visible' => true,
                        ],
                        [
                            'id' => 'cottage-industry',
                            'title' => 'Small Scale and Cottage industry',
                            'visible' => true,
                        ],
                        [
                            'id' => 'local-government-oda',
                            'title' => 'Local government office (oda)',
                            'visible' => true,
                        ],
                    ],
                ],
            ],
        ];
    }
}
