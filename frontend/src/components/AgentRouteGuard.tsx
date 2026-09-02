"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessAgentRoute, firstAllowedAgentHref } from "@/lib/agent-nav";
import type { AuthUser } from "@/lib/auth";

interface AgentRouteGuardProps {
  user: AuthUser | null;
  ready: boolean;
  children: React.ReactNode;
}

export default function AgentRouteGuard({ user, ready, children }: AgentRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !user || pathname === "/agent/login") {
      return;
    }

    if (canAccessAgentRoute(pathname, user)) {
      return;
    }

    const fallback = firstAllowedAgentHref(user);
    router.replace(fallback || "/agent/login");
  }, [pathname, ready, router, user]);

  if (!ready) {
    return null;
  }

  if (user && pathname !== "/agent/login" && !canAccessAgentRoute(pathname, user)) {
    return <div className="text-muted">Checking access...</div>;
  }

  return children;
}
