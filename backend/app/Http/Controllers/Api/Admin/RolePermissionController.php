<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Support\AgentPermissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = CompanySetting::current();
        $permissions = $this->normalizeStoredPermissions(
            $settings->dynamic_settings['role_permissions'] ?? AgentPermissions::defaults()
        );

        return response()->json([
            'roles' => AgentPermissions::roles(),
            'catalog' => AgentPermissions::catalog(),
            'permissions' => $permissions,
            'approval_roles' => AgentPermissions::immediateApprovalRoles(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $roleKeys = array_keys(AgentPermissions::roles());
        $rules = ['permissions' => 'required|array'];

        foreach ($roleKeys as $role) {
            $rules["permissions.{$role}"] = 'nullable|array';
            $rules["permissions.{$role}.*"] = 'string';
        }

        $validated = $request->validate($rules);

        $permissions = [];

        foreach ($roleKeys as $role) {
            $permissions[$role] = array_values($validated['permissions'][$role] ?? []);
        }

        $stored = $this->persistPermissions($permissions);

        return response()->json([
            'message' => 'Role permissions updated successfully.',
            'permissions' => $stored,
            'catalog' => AgentPermissions::catalog(),
            'roles' => AgentPermissions::roles(),
            'approval_roles' => AgentPermissions::immediateApprovalRoles(),
        ]);
    }

    public function updateRole(Request $request, string $role): JsonResponse
    {
        if (! array_key_exists($role, AgentPermissions::roles())) {
            abort(404, 'Role not found.');
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        $settings = CompanySetting::current();
        $dynamic = $settings->dynamic_settings ?? [];
        $stored = $this->normalizeStoredPermissions(
            $dynamic['role_permissions'] ?? AgentPermissions::defaults()
        );
        $stored[$role] = array_values($validated['permissions']);
        $stored = $this->persistPermissions($stored);

        return response()->json([
            'message' => AgentPermissions::roleLabel($role).' permissions updated successfully.',
            'permissions' => $stored,
            'catalog' => AgentPermissions::catalog(),
            'roles' => AgentPermissions::roles(),
            'approval_roles' => AgentPermissions::immediateApprovalRoles(),
        ]);
    }

    /** @param  array<string, array<int, string>>  $permissions */
    private function persistPermissions(array $permissions): array
    {
        $settings = CompanySetting::current();
        $dynamic = $settings->dynamic_settings ?? [];
        $dynamic['role_permissions'] = $permissions;
        $settings->update(['dynamic_settings' => $dynamic]);

        return $permissions;
    }

    /** @param  array<string, array<int, string>>  $stored */
    private function normalizeStoredPermissions(array $stored): array
    {
        $normalized = AgentPermissions::defaults();

        foreach (AgentPermissions::roles() as $roleKey => $roleLabel) {
            if (isset($stored[$roleKey])) {
                $normalized[$roleKey] = $stored[$roleKey];
            }
        }

        if (isset($stored['management_staff']) && ! isset($stored['manager'])) {
            $normalized['manager'] = $stored['management_staff'];
        }

        return $normalized;
    }
}
