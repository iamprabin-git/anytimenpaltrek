<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class BrevoMarketing
{
    private const API_BASE = 'https://api.brevo.com/v3';

    /** @return array{message_id: string|null, provider: string} */
    public static function sendMarketingEmail(
        User $recipient,
        string $subject,
        string $message,
        ?int $campaignId = null,
    ): array {
        if (! BrevoSettings::isConfigured()) {
            throw new RuntimeException('Brevo is not configured.');
        }

        if (BrevoSettings::shouldSyncContacts()) {
            self::syncContact($recipient);
        }

        $payload = [
            'sender' => [
                'name' => BrevoSettings::senderName(),
                'email' => BrevoSettings::senderEmail(),
            ],
            'to' => [[
                'email' => $recipient->email,
                'name' => $recipient->name,
            ]],
            'subject' => $subject,
            'textContent' => $message,
            'htmlContent' => self::textToHtml($message),
            'tags' => array_values(array_filter([
                'crm',
                'email-marketing',
                $campaignId ? "campaign-{$campaignId}" : null,
            ])),
        ];

        $response = self::request('post', '/smtp/email', $payload);

        return [
            'message_id' => isset($response['messageId']) ? (string) $response['messageId'] : null,
            'provider' => 'brevo',
        ];
    }

    public static function syncContact(User $user): void
    {
        if (! BrevoSettings::isConfigured() || ! filled($user->email)) {
            return;
        }

        [$firstName, $lastName] = self::splitName($user->name);

        $payload = [
            'email' => $user->email,
            'attributes' => array_filter([
                'FIRSTNAME' => $firstName,
                'LASTNAME' => $lastName,
                'SMS' => $user->phone,
                'COUNTRY' => $user->country,
                'LOYALTY_POINTS' => $user->loyalty_points ?? 0,
            ], fn ($value) => $value !== null && $value !== ''),
            'updateEnabled' => true,
        ];

        $listId = BrevoSettings::listId();
        if ($listId) {
            $payload['listIds'] = [$listId];
        }

        try {
            self::request('post', '/contacts', $payload);
        } catch (\Throwable $exception) {
            Log::warning('Brevo contact sync failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /** @return array<string, mixed> */
    public static function sendTestEmail(string $email, string $name): array
    {
        if (! BrevoSettings::isConfigured()) {
            throw new RuntimeException('Brevo is not configured. Enable it in admin settings and set BREVO_API_KEY in .env.');
        }

        $companyName = BrevoSettings::senderName();
        $payload = [
            'sender' => [
                'name' => $companyName,
                'email' => BrevoSettings::senderEmail(),
            ],
            'to' => [[
                'email' => $email,
                'name' => $name,
            ]],
            'subject' => "Brevo test email — {$companyName}",
            'textContent' => 'This is a test email from your Anytime Nepal Trek Brevo integration.',
            'htmlContent' => '<p>This is a test email from your <strong>Anytime Nepal Trek</strong> Brevo integration.</p>',
            'tags' => ['test', 'brevo'],
        ];

        $response = self::request('post', '/smtp/email', $payload);

        return [
            'message_id' => isset($response['messageId']) ? (string) $response['messageId'] : null,
            'provider' => 'brevo',
        ];
    }

    /** @return array<string, mixed> */
    private static function request(string $method, string $path, array $payload = []): array
    {
        $response = Http::withHeaders([
            'api-key' => BrevoSettings::apiKey(),
            'accept' => 'application/json',
            'content-type' => 'application/json',
        ])->{$method}(self::API_BASE.$path, $payload);

        if (! $response->successful()) {
            $message = $response->json('message') ?? $response->body();

            throw new RuntimeException(is_string($message) ? $message : 'Brevo API request failed.');
        }

        return $response->json() ?? [];
    }

    private static function textToHtml(string $text): string
    {
        $lines = preg_split("/\r\n|\r|\n/", trim($text)) ?: [];
        $html = '';

        foreach ($lines as $line) {
            if ($line !== '') {
                $html .= '<p>'.e($line).'</p>';
            }
        }

        return $html !== '' ? $html : '<p>'.e($text).'</p>';
    }

    /** @return array{0: string, 1: string} */
    private static function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name), 2) ?: [];

        return [
            $parts[0] ?? $name,
            $parts[1] ?? '',
        ];
    }
}
