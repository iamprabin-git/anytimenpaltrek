"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelIcon, type PanelIconName } from "@/components/panel/icons";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationButton from "@/components/NotificationButton";
import PanelUserMenu from "@/components/PanelUserMenu";
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  getPortalHome,
  getPortalLogin,
  getPortalProfile,
  isPortalAuthPage,
  type UserRole,
} from "@/lib/auth";
import { useAuthUser } from "@/hooks/useAuthUser";
import { logout } from "@/lib/admin-api";

export interface NavItem {
  href: string;
  label: string;
  icon?: PanelIconName;
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface PanelShellProps {
  role: UserRole;
  title: string;
  subtitle: string;
  navItems?: NavItem[];
  navSections?: NavSection[];
  navEmptyMessage?: string;
  children: React.ReactNode;
}

function navLinkClass(active: boolean) {
  if (active) {
    return "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium bg-white/15 text-white";
  }
  return "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors";
}

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link href={item.href} className={navLinkClass(active)}>
      {item.icon ? <PanelIcon name={item.icon} className="h-4 w-4 shrink-0 opacity-90" /> : null}
      <span>{item.label}</span>
    </Link>
  );
}

function headerActionClass() {
  return "inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted";
}

export default function PanelShell({
  role,
  title,
  subtitle,
  navItems,
  navSections,
  navEmptyMessage,
  children,
}: PanelShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const loginPath = getPortalLogin(role);
  const onLoginPage = isPortalAuthPage(pathname, role);
  const sections = navSections ?? [{ title: "", items: navItems ?? [] }];
  const profilePath = getPortalProfile(role);
  const user = useAuthUser();

  useEffect(() => {
    const authUser = getAuthUser();
    const token = getAuthToken();
    const allowed = token && authUser?.role === role && authUser.status === "active";

    if (!allowed && !onLoginPage) {
      router.replace(loginPath);
      return;
    }

    if (allowed && onLoginPage) {
      router.replace(getPortalHome(role));
      return;
    }

    setReady(true);
  }, [loginPath, onLoginPage, role, router]);

  async function signOut() {
    try {
      if (getAuthToken()) {
        await logout();
      }
    } catch {
      // network hiccup — still clear local session
    }

    clearAuthSession();
    router.push(loginPath);
  }

  if (!ready && !onLoginPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  if (onLoginPage) {
    return <div className="admin-login-shell">{children}</div>;
  }

  return (
    <div className="h-screen overflow-hidden bg-surface-muted">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-primary-dark text-white">
        <div className="shrink-0 border-b border-white/10 p-6">
          <Link href={getPortalHome(role)} className="text-xl font-bold">
            {title}
          </Link>
          <p className="mt-1 text-sm text-white/60">{subtitle}</p>
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
          {sections.some((section) => section.items.length > 0) ? (
            sections.map((section) => (
              <div key={section.title || "main"}>
                {section.title ? (
                  <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-white/40">
                    {section.title}
                  </p>
                ) : null}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarLink key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 text-sm text-white/60">{navEmptyMessage || "No navigation items available."}</p>
          )}
        </nav>
      </aside>

      <div className="ml-64 flex h-screen flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-8 py-4">
          <p className="truncate text-sm text-muted">{user?.name || subtitle}</p>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/" className={headerActionClass()}>
              <PanelIcon name="home" className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">View Site</span>
            </Link>
            <NotificationButton />
            <ThemeToggle />
            <PanelUserMenu
              name={user?.name || "Account"}
              avatarUrl={user?.avatar_url || user?.avatar}
              profilePath={profilePath}
              onLogout={signOut}
            />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
