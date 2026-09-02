<?php

namespace App\Models;

use App\Support\AgentPermissions;
use App\Support\ImageStorage;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'google_id', 'avatar', 'role', 'agent_role', 'status', 'phone', 'country', 'address', 'document_id', 'whatsapp_number', 'social_links', 'created_by', 'registration_source', 'loyalty_points'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_AGENT = 'agent';
    public const ROLE_USER = 'user';

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    public const SOURCE_WEBSITE = 'website';
    public const SOURCE_GOOGLE = 'google';
    public const SOURCE_AGENT = 'agent';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'social_links' => 'array',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function createdUsers(): HasMany
    {
        return $this->hasMany(User::class, 'created_by');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isAgent(): bool
    {
        return $this->role === self::ROLE_AGENT;
    }

    public function isCustomer(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function agentPermissions(): array
    {
        if (! $this->isAgent() || ! $this->agent_role) {
            return [];
        }

        $settings = CompanySetting::current();
        $configured = $settings->dynamic_settings['role_permissions'] ?? AgentPermissions::defaults();
        $role = $this->agent_role === 'management_staff' ? AgentPermissions::ROLE_MANAGER : $this->agent_role;

        return $configured[$role] ?? AgentPermissions::defaults()[$role] ?? [];
    }

    public function hasAgentPermission(string $permission): bool
    {
        return in_array($permission, $this->agentPermissions(), true);
    }

    public function toAuthArray(): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'phone' => $this->phone,
            'country' => $this->country,
            'avatar' => $this->avatar,
            'avatar_url' => ImageStorage::url($this->avatar),
        ];

        if ($this->isAgent()) {
            $data['agent_role'] = $this->agent_role;
            $data['permissions'] = $this->agentPermissions();
        }

        return $data;
    }
}
