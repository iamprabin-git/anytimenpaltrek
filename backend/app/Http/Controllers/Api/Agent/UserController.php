<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ChangeApproval;
use App\Support\CrmCustomerTimeline;
use App\Support\CustomerUserManager;
use App\Support\BrevoMarketing;
use App\Support\BrevoSettings;
use App\Support\EmailNotifier;
use App\Support\NotificationDispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = CustomerUserManager::customerQuery($request)->withCount('bookings')->get();
        $canViewCrm = $request->user()->hasAgentPermission('crm.view');

        return response()->json($users->map(function (User $user) use ($canViewCrm) {
            $formatted = CustomerUserManager::formatUser($user);
            $formatted['bookings_count'] = $user->bookings_count;

            if ($canViewCrm) {
                $formatted['interaction_count'] = CrmCustomerTimeline::interactionCount($user);
            }

            return $formatted;
        }));
    }

    public function export(Request $request): StreamedResponse
    {
        $users = CustomerUserManager::customerQuery($request)->get();

        $status = $request->string('status')->toString();
        $suffix = $status !== '' ? "-{$status}" : '';
        $filename = 'customers'.$suffix.'-'.now()->format('Y-m-d').'.csv';

        return CustomerUserManager::exportSpreadsheet($users, $filename);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = CustomerUserManager::validate($request, creating: true);

        $payload = [
            ...$validated,
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'] ?? User::STATUS_ACTIVE,
            'created_by' => $request->user()->id,
            'registration_source' => User::SOURCE_AGENT,
        ];

        unset($payload['avatar_file'], $payload['remove_avatar']);
        $payload = CustomerUserManager::stagePayload($request, $payload);

        return ChangeApproval::executeOrSubmit(
            $request,
            'users.create',
            'user',
            null,
            $payload,
            "Create customer {$validated['name']}",
            function () use ($request, $validated, $payload) {
                $user = new User([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => $payload['password'],
                    'phone' => $validated['phone'] ?? null,
                    'country' => $validated['country'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'document_id' => $validated['document_id'] ?? null,
                    'whatsapp_number' => $validated['whatsapp_number'] ?? null,
                    'social_links' => $payload['social_links'] ?? null,
                    'role' => User::ROLE_USER,
                    'status' => $payload['status'],
                    'created_by' => $payload['created_by'],
                    'registration_source' => User::SOURCE_AGENT,
                ]);

                CustomerUserManager::applyStagedAvatar($user, $payload);
                if (! $user->avatar) {
                    CustomerUserManager::applyValidated($user, $request, []);
                }

                $user->save();

                EmailNotifier::customerWelcome($user, $request->user()->name);

                if (BrevoSettings::isConfigured() && BrevoSettings::shouldSyncContacts()) {
                    BrevoMarketing::syncContact($user);
                }

                return response()->json([
                    'message' => 'Customer created successfully.',
                    'user' => CustomerUserManager::formatUser($user),
                ], 201);
            }
        );
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (! $user->isCustomer()) {
            return response()->json(['message' => 'Only customer accounts can be updated here.'], 422);
        }

        $validated = CustomerUserManager::validate($request, $user);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        unset($validated['avatar_file'], $validated['remove_avatar']);
        $payload = CustomerUserManager::stagePayload($request, $validated);

        return ChangeApproval::executeOrSubmit(
            $request,
            'users.update',
            'user',
            $user->id,
            $payload,
            "Update customer {$user->name}",
            function () use ($user, $request, $validated) {
                CustomerUserManager::applyValidated($user, $request, $validated);
                $user->save();

                return response()->json([
                    'message' => 'Customer updated successfully.',
                    'user' => CustomerUserManager::formatUser($user->fresh(['creator'])),
                ]);
            }
        );
    }

    public function approve(Request $request, User $user): JsonResponse
    {
        if (! $user->isCustomer()) {
            return response()->json(['message' => 'Only customer accounts can be approved here.'], 422);
        }

        return ChangeApproval::executeOrSubmit(
            $request,
            'users.approve',
            'user',
            $user->id,
            [],
            "Approve customer {$user->name}",
            function () use ($user) {
                $user->update(['status' => User::STATUS_ACTIVE]);

                NotificationDispatcher::notifyUser(
                    $user,
                    'Account approved',
                    'Your account has been approved. You can now sign in and book trips.',
                    '/account',
                    'user'
                );
                EmailNotifier::accountApproved($user);

                if (BrevoSettings::isConfigured() && BrevoSettings::shouldSyncContacts()) {
                    BrevoMarketing::syncContact($user->fresh());
                }

                return response()->json([
                    'message' => 'User approved successfully.',
                    'user' => CustomerUserManager::formatUser($user->fresh()),
                ]);
            }
        );
    }

    public function reject(Request $request, User $user): JsonResponse
    {
        if (! $user->isCustomer()) {
            return response()->json(['message' => 'Only customer accounts can be rejected here.'], 422);
        }

        return ChangeApproval::executeOrSubmit(
            $request,
            'users.reject',
            'user',
            $user->id,
            [],
            "Reject customer {$user->name}",
            function () use ($user) {
                $user->update(['status' => User::STATUS_INACTIVE]);

                NotificationDispatcher::notifyUser(
                    $user,
                    'Registration not approved',
                    'Your account registration could not be approved. Please contact us if you need assistance.',
                    '/login',
                    'user'
                );
                EmailNotifier::accountRejected($user);

                return response()->json([
                    'message' => 'User rejected successfully.',
                    'user' => CustomerUserManager::formatUser($user->fresh()),
                ]);
            }
        );
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (! $user->isCustomer()) {
            return response()->json(['message' => 'Only customer accounts can be deleted here.'], 422);
        }

        return ChangeApproval::executeOrSubmit(
            $request,
            'users.delete',
            'user',
            $user->id,
            [],
            "Delete customer {$user->name}",
            function () use ($user) {
                $user->delete();

                return response()->json(['message' => 'User deleted successfully.']);
            }
        );
    }
}
