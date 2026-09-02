<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AgentPermissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AgentController extends Controller
{
    public function index(): JsonResponse
    {
        $agents = User::where('role', User::ROLE_AGENT)
            ->with('creator:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $agent) => $this->formatAgent($agent));

        return response()->json([
            'agents' => $agents,
            'roles' => AgentPermissions::roles(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'required|string|max:50',
            'agent_role' => ['required', Rule::in(array_keys(AgentPermissions::roles()))],
            'password' => 'required|string|min:8|confirmed',
        ]);

        $agent = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'agent_role' => $validated['agent_role'],
            'password' => Hash::make($validated['password']),
            'role' => User::ROLE_AGENT,
            'status' => User::STATUS_ACTIVE,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Agent created successfully.',
            'agent' => $this->formatAgent($agent),
        ], 201);
    }

    public function update(Request $request, User $agent): JsonResponse
    {
        if (! $agent->isAgent()) {
            return response()->json(['message' => 'User is not an agent.'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$agent->id,
            'phone' => 'sometimes|string|max:50',
            'agent_role' => ['sometimes', Rule::in(array_keys(AgentPermissions::roles()))],
            'password' => 'nullable|string|min:8|confirmed',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $agent->update($validated);

        return response()->json([
            'message' => 'Agent updated successfully.',
            'agent' => $this->formatAgent($agent->fresh()),
        ]);
    }

    public function destroy(User $agent): JsonResponse
    {
        if (! $agent->isAgent()) {
            return response()->json(['message' => 'User is not an agent.'], 404);
        }

        $agent->delete();

        return response()->json(['message' => 'Agent deleted successfully.']);
    }

    private function formatAgent(User $agent): array
    {
        return [
            'id' => $agent->id,
            'name' => $agent->name,
            'email' => $agent->email,
            'phone' => $agent->phone,
            'agent_role' => $agent->agent_role,
            'agent_role_label' => AgentPermissions::roleLabel($agent->agent_role),
            'permissions' => $agent->agentPermissions(),
            'status' => $agent->status,
            'created_at' => $agent->created_at,
            'creator' => $agent->creator ? [
                'id' => $agent->creator->id,
                'name' => $agent->creator->name,
            ] : null,
        ];
    }
}
