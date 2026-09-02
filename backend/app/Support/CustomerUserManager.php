<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerUserManager
{
    public static function customerQuery(Request $request)
    {
        $query = User::where('role', User::ROLE_USER)
            ->with('creator:id,name,email')
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        CustomerContactRules::applyQuerySearch($query, $request->query('search'));

        return $query;
    }

    /** @return array<string, mixed> */
    public static function validate(Request $request, ?User $user = null, bool $creating = false): array
    {
        $emailRule = $creating
            ? 'required|email|max:255|unique:users,email'
            : 'sometimes|email|max:255|unique:users,email,'.($user?->id ?? 'NULL');

        $rules = [
            'name' => ($creating ? 'required' : 'sometimes').'|string|max:255',
            'email' => $emailRule,
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'document_id' => 'nullable|string|max:100',
            'whatsapp_number' => 'nullable|string|max:50',
            'social_facebook' => 'nullable|url|max:255',
            'social_instagram' => 'nullable|url|max:255',
            'social_twitter' => 'nullable|url|max:255',
            'social_linkedin' => 'nullable|url|max:255',
            'social_youtube' => 'nullable|url|max:255',
            'avatar_file' => ImageStorage::fileRules(),
            'remove_avatar' => 'nullable|boolean',
            'status' => 'nullable|in:pending,active,inactive',
        ];

        if ($creating) {
            $rules['password'] = 'required|string|min:8';
        } else {
            $rules['password'] = 'nullable|string|min:8';
        }

        return CustomerContactRules::validate($request, $rules, $user);
    }

    /** @param  array<string, mixed>  $validated */
    public static function applyValidated(User $user, Request $request, array $validated): User
    {
        self::applyPhoto($user, $request);

        foreach (['name', 'email', 'phone', 'country', 'address', 'document_id', 'whatsapp_number', 'status'] as $field) {
            if (array_key_exists($field, $validated)) {
                $user->{$field} = $validated[$field];
            }
        }

        if (self::hasSocialInput($request)) {
            $user->social_links = self::socialLinksFromRequest($request, $user->social_links ?? []);
        }

        return $user;
    }

    /** @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function stagePayload(Request $request, array $payload): array
    {
        if ($request->hasFile('avatar_file')) {
            $payload['staged_avatar_path'] = ImageStorage::store($request->file('avatar_file'), 'avatars', [
                'max_width' => 512,
                'quality' => 90,
            ]);
        }

        if ($request->boolean('remove_avatar')) {
            $payload['remove_avatar'] = true;
        }

        if (self::hasSocialInput($request)) {
            $payload['social_links'] = self::socialLinksFromRequest($request);
        }

        return $payload;
    }

    /** @param  array<string, mixed>  $payload */
    public static function applyStagedAvatar(User $user, array $payload): void
    {
        if (! empty($payload['remove_avatar'])) {
            ImageStorage::delete($user->avatar);
            $user->avatar = null;
        }

        if (! empty($payload['staged_avatar_path'])) {
            ImageStorage::delete($user->avatar);
            $user->avatar = $payload['staged_avatar_path'];
        }
    }

    /** @return array<string, mixed> */
    public static function formatUser(User $user): array
    {
        $socialLinks = is_array($user->social_links) ? $user->social_links : [];

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'country' => $user->country,
            'address' => $user->address,
            'document_id' => $user->document_id,
            'whatsapp_number' => $user->whatsapp_number,
            'social_links' => $socialLinks,
            'avatar' => $user->avatar,
            'avatar_url' => ImageStorage::url($user->avatar),
            'registration_source' => $user->registration_source,
            'status' => $user->status,
            'loyalty_points' => (int) ($user->loyalty_points ?? 0),
            'created_at' => $user->created_at,
            'creator' => $user->creator ? [
                'id' => $user->creator->id,
                'name' => $user->creator->name,
            ] : null,
        ];
    }

    /** @param  iterable<int, User>  $users */
    public static function exportSpreadsheet(iterable $users, string $filename = 'customers.csv'): StreamedResponse
    {
        return response()->streamDownload(function () use ($users) {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            // UTF-8 BOM helps Excel open non-ASCII characters correctly.
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'S.N.',
                'Name',
                'Email',
                'Phone',
                'WhatsApp',
                'Address',
                'Country',
                'Document ID',
                'Source',
                'Status',
                'Photo URL',
                'Facebook',
                'Instagram',
                'Twitter',
                'LinkedIn',
                'YouTube',
                'Created At',
            ]);

            $serial = 1;

            foreach ($users as $user) {
                $social = is_array($user->social_links) ? $user->social_links : [];

                fputcsv($handle, [
                    $serial,
                    $user->name,
                    $user->email,
                    $user->phone,
                    $user->whatsapp_number,
                    $user->address,
                    $user->country,
                    $user->document_id,
                    self::sourceLabel($user->registration_source),
                    $user->status,
                    ImageStorage::url($user->avatar),
                    $social['facebook'] ?? '',
                    $social['instagram'] ?? '',
                    $social['twitter'] ?? '',
                    $social['linkedin'] ?? '',
                    $social['youtube'] ?? '',
                    optional($user->created_at)?->toDateTimeString(),
                ]);

                $serial++;
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private static function applyPhoto(User $user, Request $request): void
    {
        if ($request->hasFile('avatar_file')) {
            ImageStorage::delete($user->avatar);
            $user->avatar = ImageStorage::store($request->file('avatar_file'), 'avatars', [
                'max_width' => 512,
                'quality' => 90,
            ]);

            return;
        }

        if ($request->boolean('remove_avatar')) {
            ImageStorage::delete($user->avatar);
            $user->avatar = null;
        }
    }

    private static function hasSocialInput(Request $request): bool
    {
        foreach (self::socialFieldKeys() as $key) {
            if ($request->has($key)) {
                return true;
            }
        }

        return false;
    }

    /** @param  array<string, mixed>  $existing
     * @return array<string, string|null>
     */
    private static function socialLinksFromRequest(Request $request, array $existing = []): array
    {
        $links = $existing;

        foreach (self::socialFieldKeys() as $field => $key) {
            if ($request->has($field)) {
                $value = trim((string) $request->input($field));
                $links[$key] = $value !== '' ? $value : null;
            }
        }

        return array_filter($links, fn ($value) => $value !== null && $value !== '');
    }

    /** @return array<string, string> */
    private static function socialFieldKeys(): array
    {
        return [
            'social_facebook' => 'facebook',
            'social_instagram' => 'instagram',
            'social_twitter' => 'twitter',
            'social_linkedin' => 'linkedin',
            'social_youtube' => 'youtube',
        ];
    }

    public static function sourceLabel(?string $source): string
    {
        return match ($source) {
            User::SOURCE_WEBSITE => 'Website',
            User::SOURCE_GOOGLE => 'Google',
            User::SOURCE_AGENT => 'Agent',
            default => 'Unknown',
        };
    }
}
