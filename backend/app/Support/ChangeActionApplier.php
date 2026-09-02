<?php

namespace App\Support;

use App\Models\ContactInquiry;
use App\Models\Package;
use App\Models\PendingChangeRequest;
use App\Models\Review;
use App\Models\User;
use App\Support\CustomerUserManager;
use Illuminate\Http\Request;
use RuntimeException;

class ChangeActionApplier
{
    public static function apply(PendingChangeRequest $pending): mixed
    {
        return match ($pending->action) {
            'users.create' => self::createUser($pending->payload),
            'users.update' => self::updateUser($pending->target_id, $pending->payload),
            'users.approve' => self::setUserStatus($pending->target_id, User::STATUS_ACTIVE),
            'users.reject' => self::setUserStatus($pending->target_id, User::STATUS_INACTIVE),
            'users.delete' => self::deleteUser($pending->target_id),
            'payment_settings.update' => ChangeActionApplier::applyStagedPaymentQr($pending->payload),
            'packages.create' => self::createPackage($pending->payload, $pending->requested_by),
            'packages.update' => self::updatePackage($pending->target_id, $pending->payload),
            'packages.delete' => self::deletePackage($pending->target_id),
            'reviews.approve' => self::setReviewStatus($pending->target_id, 'approved', true),
            'reviews.reject' => self::setReviewStatus($pending->target_id, 'rejected', false),
            'reviews.delete' => self::deleteReview($pending->target_id),
            'inquiries.update_status' => self::updateInquiryStatus($pending->target_id, $pending->payload['status'] ?? 'read'),
            default => throw new RuntimeException("Unsupported pending action: {$pending->action}"),
        };
    }

    /** @param  array<string, mixed>  $payload */
    private static function createUser(array $payload): User
    {
        $user = User::create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => $payload['password'],
            'phone' => $payload['phone'] ?? null,
            'country' => $payload['country'] ?? null,
            'address' => $payload['address'] ?? null,
            'document_id' => $payload['document_id'] ?? null,
            'whatsapp_number' => $payload['whatsapp_number'] ?? null,
            'social_links' => $payload['social_links'] ?? null,
            'avatar' => $payload['staged_avatar_path'] ?? null,
            'role' => User::ROLE_USER,
            'status' => $payload['status'] ?? User::STATUS_ACTIVE,
            'created_by' => $payload['created_by'] ?? null,
            'registration_source' => $payload['registration_source'] ?? User::SOURCE_AGENT,
        ]);

        return $user->fresh();
    }

    /** @param  array<string, mixed>  $payload */
    private static function updateUser(?int $userId, array $payload): User
    {
        $user = User::findOrFail($userId);
        $stagedPayload = $payload;

        if (! empty($payload['password'])) {
            $user->password = $payload['password'];
        }

        unset($payload['password'], $payload['created_by'], $payload['staged_avatar_path'], $payload['remove_avatar']);

        $user->update($payload);
        CustomerUserManager::applyStagedAvatar($user, $stagedPayload);
        $user->save();

        return $user->fresh();
    }

    private static function setUserStatus(?int $userId, string $status): User
    {
        $user = User::findOrFail($userId);
        $user->update(['status' => $status]);

        return $user->fresh();
    }

    private static function deleteUser(?int $userId): bool
    {
        return (bool) User::findOrFail($userId)->delete();
    }

    /** @param  array<string, mixed>  $payload */
    private static function createPackage(array $payload, int $requestedBy): Package
    {
        $payload['created_by'] = $requestedBy;

        return Package::create($payload);
    }

    /** @param  array<string, mixed>  $payload */
    private static function updatePackage(?int $packageId, array $payload): Package
    {
        $package = Package::findOrFail($packageId);
        $package->update($payload);

        return $package->fresh();
    }

    private static function deletePackage(?int $packageId): bool
    {
        $package = Package::findOrFail($packageId);
        ImageStorage::delete($package->getRawOriginal('image'));

        return (bool) $package->delete();
    }

    private static function setReviewStatus(?int $reviewId, string $status, bool $featured): Review
    {
        $review = Review::findOrFail($reviewId);
        $review->update(['status' => $status, 'is_featured' => $featured]);

        return $review->fresh();
    }

    private static function deleteReview(?int $reviewId): bool
    {
        return (bool) Review::findOrFail($reviewId)->delete();
    }

    private static function updateInquiryStatus(?int $inquiryId, string $status): ContactInquiry
    {
        $inquiry = ContactInquiry::findOrFail($inquiryId);
        $inquiry->update(['status' => $status]);

        return $inquiry->fresh();
    }

    public static function stagePaymentQr(Request $request): array
    {
        $fields = $request->only([
            'title',
            'instructions',
            'bank_name',
            'account_name',
            'account_number',
            'branch',
            'swift_code',
        ]);

        if ($request->has('enabled')) {
            $fields['enabled'] = $request->boolean('enabled');
        }

        $payload = [
            'fields' => $fields,
            'remove_qr' => $request->boolean('remove_qr'),
        ];

        if ($request->hasFile('qr_file')) {
            $payload['fields']['staged_qr_path'] = ImageStorage::store($request->file('qr_file'), 'payment-qr', [
                'max_width' => 1024,
                'quality' => 90,
            ]);
        }

        return $payload;
    }

    public static function applyStagedPaymentQr(array $payload): array
    {
        $fields = $payload['fields'] ?? [];
        $stagedPath = $fields['staged_qr_path'] ?? null;
        unset($fields['staged_qr_path']);

        if ($stagedPath) {
            request()->files->set('qr_file', null);
            $stored = PaymentSettings::stored();
            if (! empty($stored['qr_code'])) {
                ImageStorage::delete($stored['qr_code']);
            }

            $settings = \App\Models\CompanySetting::current();
            $dynamic = $settings->dynamic_settings ?? [];
            $current = array_replace_recursive(PaymentSettings::defaults(), $dynamic['payment_settings'] ?? []);
            $current['qr_code'] = $stagedPath;

            foreach ($fields as $key => $value) {
                if (array_key_exists($key, $current)) {
                    $current[$key] = $value;
                }
            }

            $dynamic['payment_settings'] = [
                'enabled' => (bool) ($current['enabled'] ?? true),
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

            return PaymentSettings::present($current);
        }

        return PaymentSettings::update($fields, null, (bool) ($payload['remove_qr'] ?? false));
    }
}
