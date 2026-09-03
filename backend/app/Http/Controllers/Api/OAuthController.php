<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\EmailNotifier;
use App\Support\NotificationDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'portal' => 'required|in:user,agent',
            'mode' => 'required|in:login,register',
        ]);

        if ($validated['portal'] === 'agent' && $validated['mode'] === 'register') {
            return $this->frontendError(
                'agent',
                'Agent accounts must be created by an administrator. Use Google sign-in only if you already have an agent account.'
            );
        }

        $state = base64_encode(json_encode([
            'portal' => $validated['portal'],
            'mode' => $validated['mode'],
        ], JSON_THROW_ON_ERROR));

        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => $state])
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $state = $this->decodeState($request->query('state'));
        $portal = $state['portal'] ?? 'user';
        $mode = $state['mode'] ?? 'login';

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable) {
            return $this->frontendError($portal, 'Google sign-in was cancelled or failed. Please try again.');
        }

        $user = User::where('google_id', $googleUser->getId())->first()
            ?? User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            if ($user->google_id === null) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar() ?: $user->avatar,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            } elseif ($googleUser->getAvatar() && $user->avatar !== $googleUser->getAvatar()) {
                $user->update(['avatar' => $googleUser->getAvatar()]);
            }
        } elseif ($mode === 'login') {
            return $this->frontendError(
                $portal,
                'No account found for this Google email. Please register first.'
            );
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?: Str::before($googleUser->getEmail(), '@'),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => Hash::make(Str::random(32)),
                'role' => User::ROLE_USER,
                'status' => User::STATUS_PENDING,
                'email_verified_at' => now(),
                'registration_source' => User::SOURCE_GOOGLE,
            ]);

            NotificationDispatcher::notifyAdmins(
                'New Google registration',
                "{$user->name} signed up with Google and is awaiting approval.",
                '/agent/users',
                'user'
            );
            NotificationDispatcher::notifyAgentsWithPermission(
                'users.approve',
                'New Google registration',
                "{$user->name} signed up with Google and is awaiting approval.",
                '/agent/users',
                'user'
            );

            EmailNotifier::registrationPending($user);

            if ($portal === 'user' && $mode === 'register') {
                return $this->frontendSuccess($portal, null, null, 'Registration successful. An agent will approve your account shortly.');
            }
        }

        $expectedRole = $portal === 'user' ? User::ROLE_USER : User::ROLE_AGENT;

        if ($user->role !== $expectedRole) {
            $portalLabel = $user->role === User::ROLE_AGENT ? 'agent' : 'customer';

            return $this->frontendError(
                $portal,
                "This Google account is registered as a {$portalLabel}. Please use the correct login page."
            );
        }

        if ($user->isCustomer() && ! $user->isActive()) {
            return $this->frontendError(
                $portal,
                'Your account is pending approval by an agent.'
            );
        }

        if (($user->isAdmin() || $user->isAgent()) && ! $user->isActive()) {
            return $this->frontendError($portal, 'Your account is inactive. Contact the administrator.');
        }

        $token = $user->createToken("{$user->role}-token")->plainTextToken;

        return $this->frontendSuccess($portal, $token, $user->toAuthArray());
    }

    /**
     * @return array{portal?: string, mode?: string}
     */
    private function decodeState(?string $state): array
    {
        if (! $state) {
            return [];
        }

        try {
            $decoded = json_decode(base64_decode($state, true) ?: '', true, 512, JSON_THROW_ON_ERROR);

            return is_array($decoded) ? $decoded : [];
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * @param  array<string, mixed>|null  $user
     */
    private function frontendSuccess(string $portal, ?string $token, ?array $user, ?string $message = null): RedirectResponse
    {
        $params = array_filter([
            'portal' => $portal,
            'token' => $token,
            'user' => $user ? base64_encode(json_encode($user, JSON_THROW_ON_ERROR)) : null,
            'message' => $message,
        ], fn ($value) => $value !== null && $value !== '');

        return redirect()->away($this->frontendCallbackUrl($params));
    }

    private function frontendError(string $portal, string $message): RedirectResponse
    {
        return redirect()->away($this->frontendCallbackUrl([
            'portal' => $portal,
            'error' => $message,
        ]));
    }

    /**
     * @param  array<string, string>  $params
     */
    private function frontendCallbackUrl(array $params): string
    {
        $base = rtrim(config('services.frontend.url'), '/');

        return $base.'/auth/callback?'.http_build_query($params);
    }
}
