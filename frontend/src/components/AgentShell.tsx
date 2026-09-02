"use client";

import { useEffect, useState } from "react";
import AgentRouteGuard from "@/components/AgentRouteGuard";
import PanelShell from "@/components/PanelShell";
import { filterAgentNavSections } from "@/lib/agent-nav";
import { refreshAuthUser } from "@/lib/agent-api";
import { getAuthToken, getAuthUser, setAuthSession, type AuthUser } from "@/lib/auth";

function roleLabel(agentRole?: string | null) {
  if (!agentRole) return "Operations team";
  return agentRole.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AgentShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [navSections, setNavSections] = useState(filterAgentNavSections(getAuthUser()));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const cached = getAuthUser();

    if (!token || !cached) {
      setUser(cached);
      setNavSections(filterAgentNavSections(cached));
      setReady(true);
      return;
    }

    refreshAuthUser()
      .then((fresh) => {
        setAuthSession(token, fresh);
        setUser(fresh);
        setNavSections(filterAgentNavSections(fresh));
      })
      .catch(() => {
        setUser(cached);
        setNavSections(filterAgentNavSections(cached));
      })
      .finally(() => {
        setReady(true);
      });
  }, []);

  return (
    <PanelShell
      role="agent"
      title="Agent Panel"
      subtitle={roleLabel(user?.agent_role)}
      navSections={navSections}
      navEmptyMessage="No modules are assigned to your role. Contact an administrator."
    >
      <AgentRouteGuard user={user} ready={ready}>
        {children}
      </AgentRouteGuard>
    </PanelShell>
  );
}
