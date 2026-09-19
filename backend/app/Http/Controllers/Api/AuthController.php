<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\CustomerContactRules;
use App\Support\BrevoMarketing;
use App\Support\BrevoSettings;
use App\Support\EmailNotifier;
use App\Support\NotificationDispatcher;
use App\Support\PasswordResetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
        ]);

        $validated = CustomerContactRules::normalizeInput($validated);
        CustomerContactRules::assertUniqueContacts($validated);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'] ?? null,
            'country' => $validated['country'] ?? null,
            'role' => User::ROLE_USER,
            'status' => User::STATUS_PENDING,
            'registration_source' => User::SOURCE_WEBSITE,
        ]);

        NotificationDispatcher::notifyAdmins(
            'New user registration',
            "{$user->name} registered and is awaiting approval.",
            '/agent/users',
            'user'
        );
        NotificationDispatcher::notifyAgentsWithPermission(
            'users.approve',
            'New user registration',
            "{$user->name} registered and is awaiting approval.",
            '/agent/users',
            'user'
        );

        EmailNotifier::registrationPending($user);
        EmailNotifier::staffNewRegistration($user, 'Website');

        if (BrevoSettings::isConfigured() && BrevoSettings::shouldSyncContacts()) {
            BrevoMarketing::syncContact($user);
        }

        return response()->json([
            'message' => 'Registration successful. An agent will approve your account shortly.',
            'user' => $user->toAuthArray(),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'portal' => 'nullable|in:admin,agent,user',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! $user->password || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! empty($credentials['portal'])) {
            $expectedRole = $credentials['portal'] === 'user' ? User::ROLE_USER : $credentials['portal'];
            if ($user->role !== $expectedRole) {
                return response()->json(['message' => 'You do not have access to this portal.'], 403);
            }
        }

        if ($user->isCustomer() && ! $user->isActive()) {
            return response()->json([
                'message' => 'Your account is pending approval by an agent.',
                'status' => $user->status,
            ], 403);
        }

        if (($user->isAdmin() || $user->isAgent()) && ! $user->isActive()) {
            return response()->json(['message' => 'Your account is inactive. Contact the administrator.'], 403);
        }

        $token = $user->createToken("{$user->role}-token")->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->toAuthArray(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->toAuthArray());
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'portal' => 'nullable|in:admin,agent,user',
        ]);

        PasswordResetService::sendResetLink($validated['email'], $validated['portal'] ?? null);

        return response()->json([
            'message' => 'If an account exists for that email, a password reset link has been sent.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
            'portal' => 'nullable|in:admin,agent,user',
        ]);

        $status = PasswordResetService::reset($validated);

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => 'Your password has been reset. You can sign in now.',
        ]);
    }
}
