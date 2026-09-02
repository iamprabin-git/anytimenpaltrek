<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\AgentPermissions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AgentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', User::ROLE_ADMIN)->first();

        $agents = [
            [
                'email' => 'agent@anytimenepaltrek.com',
                'name' => 'Demo Director',
                'agent_role' => AgentPermissions::ROLE_DIRECTOR,
            ],
            [
                'email' => 'manager@anytimenepaltrek.com',
                'name' => 'Demo Manager',
                'agent_role' => AgentPermissions::ROLE_MANAGER,
            ],
            [
                'email' => 'accountant@anytimenepaltrek.com',
                'name' => 'Demo Accountant',
                'agent_role' => AgentPermissions::ROLE_ACCOUNTANT,
            ],
            [
                'email' => 'reception@anytimenepaltrek.com',
                'name' => 'Demo Reception',
                'agent_role' => AgentPermissions::ROLE_RECEPTION,
            ],
        ];

        foreach ($agents as $agent) {
            User::updateOrCreate(
                ['email' => $agent['email']],
                [
                    'name' => $agent['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_AGENT,
                    'agent_role' => $agent['agent_role'],
                    'status' => User::STATUS_ACTIVE,
                    'phone' => '+977 9851086445',
                    'country' => 'Nepal',
                    'created_by' => $admin?->id,
                ]
            );
        }
    }
}
