<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CustomerContactRules
{
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        if ($trimmed === '') {
            return null;
        }

        $normalized = preg_replace('/[^\d+]/', '', $trimmed);

        return $normalized !== '' ? $normalized : null;
    }

    /** @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function normalizeInput(array $data): array
    {
        if (array_key_exists('phone', $data)) {
            $data['phone'] = self::normalize($data['phone']);
        }

        if (array_key_exists('whatsapp_number', $data)) {
            $data['whatsapp_number'] = self::normalize($data['whatsapp_number']);
        }

        return $data;
    }

    public static function contactInUse(?string $phone, ?string $whatsapp, ?int $exceptUserId = null): ?string
    {
        $numbers = array_values(array_unique(array_filter([
            self::normalize($phone),
            self::normalize($whatsapp),
        ])));

        foreach ($numbers as $number) {
            $query = User::query()
                ->where('role', User::ROLE_USER)
                ->where(function ($builder) use ($number) {
                    $builder->where('phone', $number)
                        ->orWhere('whatsapp_number', $number);
                });

            if ($exceptUserId) {
                $query->where('id', '!=', $exceptUserId);
            }

            if ($query->exists()) {
                return $number;
            }
        }

        return null;
    }

    /** @param  array<string, mixed>  $data */
    public static function assertUniqueContacts(array $data, ?int $exceptUserId = null): void
    {
        $duplicate = self::contactInUse(
            $data['phone'] ?? null,
            $data['whatsapp_number'] ?? null,
            $exceptUserId
        );

        if ($duplicate) {
            throw ValidationException::withMessages([
                'phone' => ['This contact number is already registered to another customer.'],
                'whatsapp_number' => ['This contact number is already registered to another customer.'],
            ]);
        }
    }

    /** @param  array<string, mixed>  $rules
     * @return array<string, mixed>
     */
    public static function validate(Request $request, array $rules, ?User $user = null): array
    {
        $validated = $request->validate($rules);
        $validated = self::normalizeInput($validated);
        self::assertUniqueContacts($validated, $user?->id);

        return $validated;
    }

    public static function applyQuerySearch($query, ?string $search): void
    {
        $term = trim((string) $search);

        if ($term === '') {
            return;
        }

        $like = '%'.$term.'%';

        $query->where(function ($builder) use ($like) {
            $builder->where('name', 'like', $like)
                ->orWhere('email', 'like', $like)
                ->orWhere('phone', 'like', $like)
                ->orWhere('whatsapp_number', 'like', $like)
                ->orWhere('document_id', 'like', $like)
                ->orWhere('country', 'like', $like)
                ->orWhere('address', 'like', $like)
                ->orWhere('registration_source', 'like', $like);
        });
    }
}
