<?php

namespace App\Support;

class AgentPermissions
{
    public const ROLE_DIRECTOR = 'director';

    public const ROLE_MANAGER = 'manager';

    public const ROLE_ACCOUNTANT = 'accountant';

    public const ROLE_RECEPTION = 'reception';

    /** @deprecated Use ROLE_MANAGER */
    public const ROLE_MANAGEMENT_STAFF = 'manager';

    public static function roles(): array
    {
        return [
            self::ROLE_DIRECTOR => 'Director',
            self::ROLE_MANAGER => 'Manager',
            self::ROLE_ACCOUNTANT => 'Accountant',
            self::ROLE_RECEPTION => 'Reception',
        ];
    }

    public static function catalog(): array
    {
        return [
            'dashboard.view' => 'View Dashboard',
            'profile.view' => 'View Profile',
            'profile.update' => 'Update Profile',
            'packages.view' => 'View Tour & Travel',
            'packages.create' => 'Create Tour & Travel',
            'packages.update' => 'Update Tour & Travel',
            'packages.delete' => 'Delete Tour & Travel',
            'blog.view' => 'View Blog Posts',
            'blog.create' => 'Create Blog Posts',
            'blog.update' => 'Update Blog Posts',
            'blog.delete' => 'Delete Blog Posts',
            'users.view' => 'View Customer Management',
            'users.create' => 'Create Customers',
            'users.update' => 'Update Customer Details',
            'users.approve' => 'Approve / Reject Customers',
            'users.delete' => 'Delete Customers',
            'payment_settings.view' => 'View Payment QR & Bank Details',
            'payment_settings.update' => 'Manage Payment QR & Bank Details',
            'reviews.view' => 'View Review Management',
            'reviews.approve' => 'Approve / Reject Reviews',
            'reviews.delete' => 'Delete Reviews',
            'inquiries.view' => 'View Inquiry Management',
            'inquiries.update' => 'Update Inquiry Status',
            'bookings.view' => 'View Booking Requests',
            'bookings.approve' => 'Approve / Reject Booking Requests',
            'crm.view' => 'View CRM Dashboard & Customer Insights',
            'crm.interactions.create' => 'Log CRM Notes & Interactions',
            'crm.campaigns.view' => 'View Marketing Campaigns',
            'crm.campaigns.manage' => 'Create & Send Marketing Campaigns',
            'analytics.view' => 'View Dashboard Analytics & Reports',
            'approvals.view' => 'View Pending Change Requests',
            'approvals.review' => 'Approve / Reject Staff Changes',
        ];
    }

    public static function defaults(): array
    {
        $all = array_keys(self::catalog());

        return [
            self::ROLE_DIRECTOR => $all,
            self::ROLE_MANAGER => array_values(array_diff($all, [])),
            self::ROLE_ACCOUNTANT => [
                'dashboard.view',
                'analytics.view',
                'profile.view',
                'profile.update',
                'payment_settings.view',
                'payment_settings.update',
                'bookings.view',
                'crm.view',
                'packages.view',
                'blog.view',
                'approvals.view',
            ],
            self::ROLE_RECEPTION => [
                'dashboard.view',
                'analytics.view',
                'profile.view',
                'profile.update',
                'users.view',
                'users.create',
                'users.update',
                'users.approve',
                'inquiries.view',
                'inquiries.update',
                'reviews.view',
                'reviews.approve',
                'crm.view',
                'crm.interactions.create',
                'crm.campaigns.view',
                'packages.view',
                'blog.view',
                'approvals.view',
            ],
        ];
    }

    /** Roles that apply changes immediately without manager approval. */
    public static function immediateApprovalRoles(): array
    {
        return [self::ROLE_DIRECTOR, self::ROLE_MANAGER];
    }

    public static function roleLabel(?string $role): ?string
    {
        if (! $role) {
            return null;
        }

        return self::roles()[$role] ?? ucfirst(str_replace('_', ' ', $role));
    }
}
