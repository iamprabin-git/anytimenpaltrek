"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MediaImage from "@/components/MediaImage";
import NotificationButton from "@/components/NotificationButton";
import PanelHelpButton from "@/components/PanelHelpButton";
import PanelUserMenu from "@/components/PanelUserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { PanelIcon } from "@/components/panel/icons";
import { getAdminCompanySettings, logout } from "@/lib/admin-api";
import { ADMIN_NAV_SECTIONS, getAdminPageMeta } from "@/lib/admin-nav";
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  isLoggedInAs,
  subscribeToAuthSession,
  type AuthUser,
} from "@/lib/auth";
import { resolveMediaUrl } from "@/lib/media";

function navLinkClass(active: boolean) {
  return active
    ? "admin-nav-link admin-nav-link-active"
    : "admin-nav-link";
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {ADMIN_NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="admin-nav-section-title">{section.title}</p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={navLinkClass(active)}
                >
                  <span className="admin-nav-icon">
                    <PanelIcon name={item.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.label}</span>
                    {active ? <span className="admin-nav-description">{item.description}</span> : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AdminBrand({
  companyName,
  logoUrl,
  compact = false,
}: {
  companyName: string;
  logoUrl: string | null;
  compact?: boolean;
}) {
  return (
    <Link href="/admin" className="admin-brand">
      <div className="admin-brand-logo">
        {logoUrl ? (
          <MediaImage src={logoUrl} alt={companyName} fill className="object-contain p-1.5" />
        ) : (
          <PanelIcon name="building" className="h-6 w-6 text-white/90" />
        )}
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{companyName}</p>
          <p className="text-xs text-white/55">Admin Console</p>
        </div>
      ) : null}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companyName, setCompanyName] = useState("Anytime Nepal Trek");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const onLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  const pageMeta = getAdminPageMeta(pathname);

  useEffect(() => {
    const authUser = getAuthUser();
    const token = getAuthToken();
    const allowed = token && authUser?.role === "admin" && authUser.status === "active";

    if (!allowed && !onLoginPage) {
      router.replace("/admin/login");
      return;
    }

    if (allowed && onLoginPage) {
      router.replace("/admin");
      return;
    }

    setUser(authUser);
    setReady(true);
  }, [onLoginPage, router]);

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    return subscribeToAuthSession(syncUser);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!ready || !isLoggedInAs("admin")) return;

    getAdminCompanySettings()
      .then((data) => {
        setCompanyName(data.company_name || "Anytime Nepal Trek");
        setLogoUrl(resolveMediaUrl(data.logo_url || data.logo));
      })
      .catch(() => {});
  }, [ready]);

  async function signOut() {
    try {
      if (getAuthToken()) {
        await logout();
      }
    } catch {
      // still clear local session
    }

    clearAuthSession();
    router.push("/admin/login");
  }

  if (!ready && !onLoginPage) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-card">
          <div className="admin-loading-spinner" />
          <p className="text-sm text-muted">Loading admin console...</p>
        </div>
      </div>
    );
  }

  if (onLoginPage) {
    return <div className="admin-login-shell">{children}</div>;
  }

  return (
    <div className="admin-shell">
      {mobileNavOpen ? (
        <button
          type="button"
          className="admin-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside className={`admin-sidebar ${mobileNavOpen ? "admin-sidebar-open" : ""}`}>
        <div className="admin-sidebar-header">
          <AdminBrand companyName={companyName} logoUrl={logoUrl} />
        </div>

        <SidebarNav pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-sidebar-footer-link">
            <PanelIcon name="home" className="h-4 w-4" />
            View public site
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="admin-icon-button lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <PanelIcon name="menu" className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="admin-breadcrumb">
                <span>{pageMeta.section}</span>
                <span aria-hidden="true">/</span>
                <span className="text-foreground">{pageMeta.title}</span>
              </div>
              <p className="admin-topbar-description">{pageMeta.description}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/" className="admin-topbar-action hidden sm:inline-flex">
              <PanelIcon name="home" className="h-4 w-4" />
              View Site
            </Link>
            <PanelHelpButton role="admin" variant="admin" />
            <NotificationButton />
            <ThemeToggle />
            <PanelUserMenu
              name={user?.name || "Admin"}
              avatarUrl={user?.avatar_url || user?.avatar}
              profilePath="/admin/profile"
              onLogout={signOut}
            />
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
