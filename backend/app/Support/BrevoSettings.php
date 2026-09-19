<?php

namespace App\Support;

use App\Models\CompanySetting;

class BrevoSettings
{
    /** @return array<string, mixed> */
    public static function defaults(): array
    {
        return [
            'enabled' => false,
            'list_id' => null,
            'sender_email' => null,
            'sender_name' => null,
            'sync_contacts' => true,
        ];
    }

    /** @return array<string, mixed> */
    public static function stored(): array
    {
        $settings = CompanySetting::current();

        return array_replace_recursive(
            self::defaults(),
            $settings->dynamic_settings['brevo_settings'] ?? []
        );
    }

    public static function apiKey(): ?string
    {
        $key = config('services.brevo.key');

        return filled($key) ? (string) $key : null;
    }

    public static function isEnabled(): bool
    {
        return (bool) (self::stored()['enabled'] ?? false);
    }

    public static function isConfigured(): bool
    {
        return self::isEnabled()
            && self::apiKey() !== null
            && filled(self::senderEmail());
    }

    public static function senderEmail(): ?string
    {
        $stored = self::stored();
        $email = $stored['sender_email'] ?? null;

        if (filled($email)) {
            return (string) $email;
        }

        $companyEmail = CompanySetting::current()->email;

        return filled($companyEmail) ? (string) $companyEmail : null;
    }

    public static function senderName(): string
    {
        $stored = self::stored();
        $name = $stored['sender_name'] ?? null;

        if (filled($name)) {
            return (string) $name;
        }

        return CompanySetting::current()->company_name ?? (string) config('app.name', 'Anytime Nepal Trek');
    }

    public static function listId(): ?int
    {
        $listId = self::stored()['list_id'] ?? null;

        if ($listId === null || $listId === '') {
            return null;
        }

        return (int) $listId;
    }

    public static function shouldSyncContacts(): bool
    {
        return (bool) (self::stored()['sync_contacts'] ?? true);
    }

    /** @return array<string, mixed> */
    public static function status(): array
    {
        $stored = self::stored();

        return [
            'enabled' => self::isEnabled(),
            'configured' => self::isConfigured(),
            'api_key_set' => self::apiKey() !== null,
            'sender_email' => self::senderEmail(),
            'sender_name' => self::senderName(),
            'list_id' => self::listId(),
            'sync_contacts' => self::shouldSyncContacts(),
            'provider' => 'brevo',
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function update(array $input): array
    {
        $settings = CompanySetting::current();
        $dynamic = $settings->dynamic_settings ?? [];
        $current = array_replace_recursive(self::defaults(), $dynamic['brevo_settings'] ?? []);

        if (array_key_exists('enabled', $input)) {
            $current['enabled'] = (bool) $input['enabled'];
        }

        if (array_key_exists('list_id', $input)) {
            $current['list_id'] = filled($input['list_id']) ? (int) $input['list_id'] : null;
        }

        if (array_key_exists('sender_email', $input)) {
            $current['sender_email'] = filled($input['sender_email']) ? (string) $input['sender_email'] : null;
        }

        if (array_key_exists('sender_name', $input)) {
            $current['sender_name'] = filled($input['sender_name']) ? (string) $input['sender_name'] : null;
        }

        if (array_key_exists('sync_contacts', $input)) {
            $current['sync_contacts'] = (bool) $input['sync_contacts'];
        }

        $dynamic['brevo_settings'] = $current;
        $settings->update(['dynamic_settings' => $dynamic]);

        return self::status();
    }
}
