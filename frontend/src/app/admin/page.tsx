"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { PanelIcon } from "@/components/panel/icons";
import { getAdminDashboard } from "@/lib/admin-api";
import { ADMIN_SHORTCUTS } from "@/lib/admin-nav";
import { getAuthUser } from "@/lib/auth";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number | string> | null>(null);
  const [companyName, setCompanyName] = useState("");
  const userName = getAuthUser()?.name || "Admin";

  useEffect(() => {
    getAdminDashboard()
      .then((data) => {
        setStats(data.stats);
        setCompanyName(data.company.company_name);
      })
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="admin-stat-card animate-pulse">
            <div className="h-4 w-24 rounded bg-surface-muted" />
            <div className="mt-4 h-8 w-32 rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    { label: "Active Agents", value: stats.agents, icon: "users" as const, tone: "default" as const },
    { label: "Registered Users", value: stats.users, icon: "profile" as const, tone: "success" as const },
    { label: "Pending Users", value: stats.pending_users, icon: "inbox" as const, tone: "warning" as const },
    { label: "Live Packages", value: stats.packages, icon: "map" as const, tone: "default" as const },
    { label: "Paid Bookings", value: stats.paid_bookings, icon: "payments" as const, tone: "accent" as const },
    {
      label: "Total Revenue",
      value: `$${Number(stats.total_revenue).toLocaleString()}`,
      icon: "star" as const,
      tone: "success" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="admin-hero">
        <div className="admin-hero-grid" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{userName}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/78 sm:text-base">
              Manage {companyName || "your company"} from one dynamic control center — team access, branding, homepage
              content, and business performance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/content" className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-sm transition hover:bg-white/90">
              Edit site content
            </Link>
            <Link href="/admin/appearance" className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Customize appearance
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Live metrics</h3>
            <p className="text-sm text-muted">Updated dynamically from your booking and user data.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => (
            <AdminStatCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-foreground">Quick actions</h3>
          <p className="text-sm text-muted">Jump straight into the most-used admin tools.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ADMIN_SHORTCUTS.map((item) => (
            <Link key={item.href} href={item.href} className="admin-shortcut-card">
              <span className="admin-shortcut-icon">
                <PanelIcon name={item.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-foreground">{item.label}</span>
                <span className="mt-1 block text-sm text-muted">{item.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
