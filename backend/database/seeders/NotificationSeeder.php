<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\NotificationDispatcher;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@anytimenepaltrek.com')->first();
        $agent = User::where('email', 'agent@anytimenepaltrek.com')->first();

        if ($admin) {
            NotificationDispatcher::notifyUser(
                $admin,
                'Welcome to the admin panel',
                'Manage agents, company settings, and site content from here.',
                '/admin',
                'system'
            );
            NotificationDispatcher::notifyUser(
                $admin,
                'Review role permissions',
                'Configure what Director and Management Staff can access.',
                '/admin/roles',
                'system'
            );
        }

        if ($agent) {
            NotificationDispatcher::notifyUser(
                $agent,
                'Agent panel ready',
                'You can manage tours, users, reviews, and inquiries.',
                '/agent',
                'system'
            );
            NotificationDispatcher::notifyUser(
                $agent,
                'Pending user approvals',
                'Check the user management section for accounts awaiting approval.',
                '/agent/users',
                'user'
            );
        }

        $customer = User::where('role', User::ROLE_USER)->where('status', User::STATUS_ACTIVE)->first();
        if ($customer) {
            NotificationDispatcher::notifyUser(
                $customer,
                'Welcome back',
                'View your bookings and profile from your account dashboard.',
                '/account',
                'system'
            );
        }
    }
}
