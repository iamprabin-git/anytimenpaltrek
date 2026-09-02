"use client";

import ProfileEditor from "@/components/ProfileEditor";
import { getAgentProfile, updateAgentProfileForm } from "@/lib/agent-api";

export default function AgentProfilePage() {
  return (
    <ProfileEditor
      subtitle="Manage your account photo, details, and password."
      loadProfile={getAgentProfile}
      saveProfile={updateAgentProfileForm}
      renderDetails={(profile) => (
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="font-medium capitalize">{profile.agent_role_label || profile.agent_role || "Agent"}</dd>
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
