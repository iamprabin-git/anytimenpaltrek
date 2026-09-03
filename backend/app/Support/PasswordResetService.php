<?php

namespace App\Support;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Support\EmailNotifier;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    public static function sendResetLink(string $email, ?string $portal = null): void
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! self::canResetForPortal($user, $portal)) {
            return;
        }

        $token = Password::broker('users')->createToken($user);
        $user->notify(new ResetPasswordNotification($token, self::resolvePortal($user, $portal)));
    }

    /** @param  array{email:string,token:string,password:string,password_confirmation:string,portal?:string|null}  $credentials */
    public static function reset(array $credentials): string
    {
        $portal = $credentials['portal'] ?? null;

        return Password::broker('users')->reset(
            [
                'email' => $credentials['email'],
                'password' => $credentials['password'],
                'password_confirmation' => $credentials['password_confirmation'],
                'token' => $credentials['token'],
            ],
            function (User $user, string $password) use ($portal) {
                if (! self::canResetForPortal($user, $portal)) {
                    throw ValidationException::withMessages([
                        'email' => ['This reset link is not valid for this account.'],
                    ]);
                }

                $user->forceFill(['password' => $password])->save();

                EmailNotifier::passwordResetSuccess($user, self::resolvePortal($user, $portal));
            }
        );
    }

    private static function canResetForPortal(User $user, ?string $portal): bool
    {
        if ($portal) {
            $expectedRole = $portal === 'user' ? User::ROLE_USER : $portal;
            if ($user->role !== $expectedRole) {
                return false;
            }
        }

        if ($user->isCustomer() && ! $user->isActive()) {
            return false;
        }

        if (($user->isAdmin() || $user->isAgent()) && ! $user->isActive()) {
            return false;
        }

        return true;
    }

    private static function resolvePortal(User $user, ?string $portal): string
    {
        if ($portal) {
            return $portal;
        }

        return $user->role === User::ROLE_USER ? 'user' : $user->role;
    }
}
