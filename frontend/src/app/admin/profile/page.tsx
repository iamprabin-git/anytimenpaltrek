"use client";

import ProfileEditor from "@/components/ProfileEditor";
import { getAdminProfile, updateAdminProfileForm } from "@/lib/admin-api";

export default function AdminProfilePage() {
  return (
    <ProfileEditor
      subtitle="Manage your admin account photo, details, and password."
      loadProfile={getAdminProfile}
      saveProfile={updateAdminProfileForm}
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
