"use client";

import { useEffect, useState, type ReactNode } from "react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { getAuthToken, setAuthSession, type AuthUser } from "@/lib/auth";
import { resolveAvatarUrl } from "@/lib/media";

interface ProfileEditorProps {
  title?: string;
  subtitle?: string;
  loadProfile: () => Promise<AuthUser & { agent_role_label?: string | null }>;
  saveProfile: (formData: FormData) => Promise<{ message: string; user: AuthUser }>;
  renderDetails?: (profile: AuthUser & { agent_role_label?: string | null }) => ReactNode;
}

export default function ProfileEditor({
  title = "My Profile",
  subtitle = "Manage your account details, photo, and password.",
  loadProfile,
  saveProfile,
  renderDetails,
}: ProfileEditorProps) {
  const [profile, setProfile] = useState<(AuthUser & { agent_role_label?: string | null }) | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    loadProfile()
      .then(setProfile)
      .catch(() => setError("Failed to load profile."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleFileSelect(file: File | null) {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setRemoveAvatar(false);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleRemovePhoto() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = formData.get("password") as string;
    const passwordConfirmation = formData.get("password_confirmation") as string;
    const currentPassword = formData.get("current_password") as string;

    if (password && password !== passwordConfirmation) {
      setError("Password and confirm password do not match.");
      return;
    }

    if (avatarFile) {
      formData.set("avatar_file", avatarFile);
    }

    if (removeAvatar) {
      formData.set("remove_avatar", "1");
    }

    formData.delete("password");
    formData.delete("password_confirmation");
    formData.delete("current_password");
    if (password) {
      formData.set("password", password);
      formData.set("password_confirmation", passwordConfirmation);
      if (currentPassword) {
        formData.set("current_password", currentPassword);
      }
    }

    try {
      const result = await saveProfile(formData);
      setProfile((current) => ({ ...current, ...result.user }));
      const token = getAuthToken();
      if (token) setAuthSession(token, result.user);
      setAvatarFile(null);
      setRemoveAvatar(false);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      setMessage(result.message);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    }
  }

  if (!profile) {
    return <p className="text-muted">{error || "Loading profile..."}</p>;
  }

  const displayAvatarUrl = removeAvatar ? null : resolveAvatarUrl(profile);

  return (
    <div>
      <h1 className="panel-title mb-2">{title}</h1>
      <p className="mb-8 text-sm text-muted">{subtitle}</p>

      <div className="panel-card mb-8 max-w-2xl">
        <ProfileAvatar
          name={profile.name}
          avatarUrl={displayAvatarUrl}
          previewUrl={avatarPreview}
          editable
          showRemove={!!displayAvatarUrl || !!avatarPreview}
          onFileSelect={handleFileSelect}
          onRemove={handleRemovePhoto}
        />
      </div>

      {renderDetails ? <div className="panel-card mb-8 max-w-2xl">{renderDetails(profile)}</div> : null}

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <form onSubmit={handleSubmit} className="panel-card max-w-2xl space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <input name="name" defaultValue={profile.name} required className="panel-input" key={`name-${profile.name}`} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input name="phone" defaultValue={profile.phone || ""} className="panel-input" key={`phone-${profile.phone}`} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <input name="country" defaultValue={profile.country || ""} className="panel-input" key={`country-${profile.country}`} />
        </div>
        <div className="border-t border-border pt-4">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Change Password</h2>
          <p className="mb-4 text-xs text-muted">
            Leave blank to keep your current password. Google sign-in users can set a password here without entering a current one.
          </p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Current Password</label>
              <input
                name="current_password"
                type="password"
                autoComplete="current-password"
                placeholder="Required when changing password"
                className="panel-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">New Password</label>
              <input
                name="password"
                type="password"
                minLength={8}
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
                className="panel-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
              <input
                name="password_confirmation"
                type="password"
                minLength={8}
                autoComplete="new-password"
                className="panel-input"
              />
            </div>
          </div>
        </div>
        <button type="submit" className="btn-primary">
          Save Profile
        </button>
      </form>
    </div>
  );
}
