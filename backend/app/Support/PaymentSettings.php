<?php

namespace App\Support;

use App\Models\CompanySetting;
use Illuminate\Http\UploadedFile;

class PaymentSettings
{
    /** @return array<string, mixed> */
    public static function defaults(): array
    {
        return [
            'enabled' => true,
            'title' => 'Bank Transfer & QR Payment',
            'instructions' => 'Please include your full name and booking reference in the payment note.',
            'bank_name' => 'Nepal Bank Ltd.',
            'account_name' => 'Anytime Nepal Trek Pvt. Ltd.',
            'account_number' => '',
            'branch' => 'Kathmandu',
            'swift_code' => '',
            'qr_code' => null,
        ];
    }

    /** @return array<string, mixed> */
    public static function stored(): array
    {
        $settings = CompanySetting::current();

        return array_replace_recursive(
            self::defaults(),
            $settings->dynamic_settings['payment_settings'] ?? []
        );
    }

    /** @return array<string, mixed> */
    public static function present(?array $stored = null): array
    {
        $stored ??= self::stored();

        return [
            'enabled' => (bool) ($stored['enabled'] ?? true),
            'title' => (string) ($stored['title'] ?? ''),
            'instructions' => (string) ($stored['instructions'] ?? ''),
            'bank_name' => (string) ($stored['bank_name'] ?? ''),
            'account_name' => (string) ($stored['account_name'] ?? ''),
            'account_number' => (string) ($stored['account_number'] ?? ''),
            'branch' => (string) ($stored['branch'] ?? ''),
            'swift_code' => (string) ($stored['swift_code'] ?? ''),
            'qr_code_url' => ImageStorage::url($stored['qr_code'] ?? null),
        ];
    }

    /** @return array<string, mixed>|null */
    public static function presentForCustomer(): ?array
    {
        $stored = self::stored();

        if (! ($stored['enabled'] ?? true)) {
            return null;
        }

        return self::present($stored);
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function update(array $input, ?UploadedFile $qrFile = null, bool $removeQr = false): array
    {
        $settings = CompanySetting::current();
        $dynamic = $settings->dynamic_settings ?? [];
        $current = array_replace_recursive(self::defaults(), $dynamic['payment_settings'] ?? []);

        if ($removeQr && ! empty($current['qr_code'])) {
            ImageStorage::delete($current['qr_code']);
            $current['qr_code'] = null;
        }

        if ($qrFile) {
            if (! empty($current['qr_code'])) {
                ImageStorage::delete($current['qr_code']);
            }

            $current['qr_code'] = ImageStorage::store($qrFile, 'payment-qr', [
                'max_width' => 1024,
                'quality' => 90,
            ]);
        }

        foreach (['title', 'instructions', 'bank_name', 'account_name', 'account_number', 'branch', 'swift_code'] as $field) {
            if (array_key_exists($field, $input)) {
                $current[$field] = (string) $input[$field];
            }
        }

        if (array_key_exists('enabled', $input)) {
            $current['enabled'] = filter_var($input['enabled'], FILTER_VALIDATE_BOOLEAN);
        }

        $dynamic['payment_settings'] = [
            'enabled' => (bool) $current['enabled'],
            'title' => $current['title'],
            'instructions' => $current['instructions'],
            'bank_name' => $current['bank_name'],
            'account_name' => $current['account_name'],
            'account_number' => $current['account_number'],
            'branch' => $current['branch'],
            'swift_code' => $current['swift_code'],
            'qr_code' => $current['qr_code'],
        ];

        $settings->update(['dynamic_settings' => $dynamic]);

        return self::present($current);
    }
}
