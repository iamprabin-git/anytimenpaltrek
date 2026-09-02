"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PanelIcon } from "@/components/panel/icons";
import { AGENT_DASHBOARD_STATS, getAllowedAgentQuickLinks } from "@/lib/agent-nav";
import { getAgentDashboard } from "@/lib/agent-api";
import { getAuthUser, hasPermission } from "@/lib/auth";

export default function AgentDashboardPage() {
  const user = getAuthUser();
  const canViewDashboard = hasPermission("dashboard.view", user);
  const [stats, setStats] = useState<Record<string, number | string> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canViewDashboard) {
      return;
    }

    getAgentDashboard()
      .then((data) => setStats(data.stats))
      .catch(() => setError("Failed to load dashboard."));
  }, [canViewDashboard]);

  const statCards = useMemo(() => {
    if (!stats) return [];

    return AGENT_DASHBOARD_STATS.filter((card) => hasPermission(card.permission, user)).map((card) => ({
      label: card.label,
      value: stats[card.key] ?? 0,
    }));
  }, [stats, user]);

  const links = getAllowedAgentQuickLinks(user);

  if (!canViewDashboard) {
    return (
      <div>
        <h1 className="panel-title mb-2">Agent Panel</h1>
        <p className="mb-8 text-sm text-muted">Your role does not include dashboard access. Use the modules below.</p>
        {links.length === 0 ? (
          <p className="text-muted">No modules are assigned to your role. Contact an administrator.</p>
        ) : (
          <>
            <h2 className="mb-4 text-xl font-bold text-foreground">Your modules</h2>
            <ModuleLinks links={links} />
          </>
        )}
      </div>
    );
  }

  if (!stats && !error) {
    return <p className="text-muted">Loading dashboard...</p>;
  }

  return (
    <div>
      <h1 className="panel-title mb-2">Agent Dashboard</h1>
      <p className="text-muted mb-8 text-sm">A quick snapshot of what needs your attention today.</p>

      {hasPermission("analytics.view", user) ? (
        <div className="mb-8">
          <Link href="/agent/analytics" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
            Open Analytics Dashboard
          </Link>
        </div>
      ) : null}

      {error ? <p className="mb-6 text-red-600">{error}</p> : null}

      {statCards.length > 0 ? (
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.label} className="panel-card">
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {links.length > 0 ? (
        <>
          <h2 className="mb-4 text-xl font-bold text-foreground">Jump to a module</h2>
          <ModuleLinks links={links} />
        </>
      ) : null}
    </div>
  );
}

function ModuleLinks({
  links,
}: {
  links: Array<{ href: string; label: string; icon: import("@/components/panel/icons").PanelIconName; note?: string }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="panel-card card-hover flex items-start gap-3">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <PanelIcon name={link.icon} className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-foreground">{link.label}</span>
            {link.note ? <span className="mt-1 block text-sm text-muted">{link.note}</span> : null}
          </span>
        </Link>
      ))}
    </div>
  );
}
