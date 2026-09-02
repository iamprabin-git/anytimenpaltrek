<?php

namespace App\Support;

class ThemeSettings
{
    public static function defaults(): array
    {
        return [
            'colors' => [
                'primary' => '#2d6a4f',
                'primary_dark' => '#1b4332',
                'secondary' => '#40916c',
                'accent' => '#f4a261',
                'background' => '#ffffff',
                'foreground' => '#1a1a1a',
                'surface' => '#ffffff',
                'surface_muted' => '#f9fafb',
                'muted' => '#6b7280',
                'border' => '#e5e7eb',
            ],
            'fonts' => [
                'body' => 'geist',
                'heading' => 'geist',
            ],
            'footer' => [
                'background' => '#0f594d',
                'background_dark' => '#083f37',
                'text' => '#b8e6d3',
                'link' => '#b8e6d3',
                'link_hover' => '#ffffff',
                'heading' => '#ffffff',
                'card_background' => '#083f37',
                'input_background' => '#083f37',
                'subscribe_button' => '#22c55e',
                'subscribe_button_hover' => '#16a34a',
                'border' => '#0a4a40',
                'icon_background' => '#ffffff',
                'badge_text' => '#0f594d',
                'support_text' => '#9ee5c8',
                'copyright_text' => '#9ee5c8',
            ],
        ];
    }

    public static function fontOptions(): array
    {
        return [
            'geist' => 'Geist (Default)',
            'inter' => 'Inter',
            'roboto' => 'Roboto',
            'poppins' => 'Poppins',
            'lora' => 'Lora',
            'montserrat' => 'Montserrat',
            'open_sans' => 'Open Sans',
            'playfair' => 'Playfair Display',
        ];
    }

    /** @param  array<string, mixed>|null  $stored */
    public static function merge(?array $stored): array
    {
        $defaults = self::defaults();
        $stored = is_array($stored) ? $stored : [];

        return [
            'colors' => array_merge($defaults['colors'], $stored['colors'] ?? []),
            'fonts' => array_merge($defaults['fonts'], $stored['fonts'] ?? []),
            'footer' => array_merge($defaults['footer'], $stored['footer'] ?? []),
        ];
    }
}
