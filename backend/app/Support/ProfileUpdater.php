<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileUpdater
{
    /** @return array<string, mixed> */
    public static function validate(Request $request, ?User $user = null): array
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            'current_password' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
            'avatar_file' => ImageStorage::fileRules(),
            'remove_avatar' => 'nullable|boolean',
        ]);

        $validated = CustomerContactRules::normalizeInput($validated);

        if ($user?->isCustomer()) {
            CustomerContactRules::assertUniqueContacts($validated, $user->id);
        }

        return $validated;
    }

    public static function update(User $user, Request $request, array $validated): User
    {
        if ($request->hasFile('avatar_file')) {
            self::deleteStoredAvatar($user);
            $user->avatar = ImageStorage::store($request->file('avatar_file'), 'avatars', [
                'max_width' => 512,
                'quality' => 90,
            ]);
        } elseif ($request->boolean('remove_avatar')) {
            self::deleteStoredAvatar($user);
            $user->avatar = null;
        }

        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }

        if (array_key_exists('country', $validated)) {
            $user->country = $validated['country'];
        }

        if (! empty($validated['password'])) {
            if ($user->password) {
                $currentPassword = $validated['current_password'] ?? '';
                if ($currentPassword === '' || ! Hash::check($currentPassword, $user->password)) {
                    throw ValidationException::withMessages([
                        'current_password' => ['The current password is incorrect.'],
                    ]);
                }
            }

            $user->password = $validated['password'];
        }

        $user->save();

        return $user->fresh();
    }

    private static function deleteStoredAvatar(User $user): void
    {
        ImageStorage::delete($user->avatar);
    }
}
