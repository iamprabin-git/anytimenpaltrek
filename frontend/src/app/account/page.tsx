"use client";

import ProfileEditor from "@/components/ProfileEditor";
import { getUserProfile, updateUserProfileForm } from "@/lib/user-api";

export default function AccountPage() {
  return (
    <ProfileEditor
      subtitle="Manage your profile photo, contact details, and password."
      loadProfile={getUserProfile}
      saveProfile={updateUserProfileForm}
      renderDetails={(profile) => (
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Account Status</dt>
            <dd className="font-medium capitalize">{profile.status}</dd>
          </div>
        </dl>
      )}
    />
  );
}
