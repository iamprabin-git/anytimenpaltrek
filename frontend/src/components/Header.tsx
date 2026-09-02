"use client";

import HeaderNavDropdown from "@/components/HeaderNavDropdown";
import HeaderSocialLinks from "@/components/HeaderSocialLinks";
import MediaImage from "@/components/MediaImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteContent } from "@/components/SiteContentProvider";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { isLoggedInAs } from "@/lib/auth";
import { resolveMediaUrl } from "@/lib/media";
import { buildHeaderNavLayout } from "@/lib/site-content";
import type { NavLink } from "@/types/site-content";

function NavLinkItem({ item, onNavigate }: { item: NavLink; onNavigate?: () => void }) {
  return (
    <Link
      href={item.href}
      className="text-foreground/80 hover:text-primary font-medium text-sm transition-colors whitespace-nowrap"
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}

function MobileNavLinkItem({ item, onNavigate }: { item: NavLink; onNavigate?: () => void }) {
  return (
    <Link
      href={item.href}
      className="block text-foreground/80 hover:text-primary font-medium py-2"
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  );
}

export default function Header() {
  const { site, company } = useSiteContent();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedInAs("user"));
  }, []);

  const companyName = company?.company_name || "Anytime Nepal Trek";
  const logoUrl = resolveMediaUrl(company?.logo_url || company?.logo) || null;
  const supportText = String(company?.dynamic_settings?.support_hours || "24/7 Support [Viber & WhatsApp]");
  const { activities, companyMenu, connect } = buildHeaderNavLayout(site ?? undefined);
  const loginLabel = site?.header?.login_label || "Login";
  const accountLabel = site?.header?.account_label || "My Account";

  const brandParts = companyName.split(" ");
  const firstPart = brandParts[0] || "Anytime";
  const restPart = brandParts.slice(1).join(" ") || "Nepal Trek";

  return (
    <header className="sticky top-0 z-50 bg-surface shadow-md border-b border-border transition-colors duration-200">
      <div className="bg-primary-dark text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center gap-3">
          <span className="truncate">{supportText}</span>
          <HeaderSocialLinks dynamic={company?.dynamic_settings as Record<string, unknown> | null | undefined} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20 gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0 min-w-0">
            {logoUrl ? (
              <>
                <div className="relative h-10 w-10 md:h-12 md:w-12 shrink-0">
                  <MediaImage src={logoUrl} alt={companyName} fill className="object-contain" />
                </div>
                <div className="hidden md:flex items-center gap-1 min-w-0">
                  <span className="text-2xl font-bold text-primary">{firstPart}</span>
                  <span className="text-2xl font-light text-muted">{restPart}</span>
                </div>
              </>
            ) : (
              <>
                <span className="text-xl md:text-2xl font-bold text-primary">{firstPart}</span>
                <span className="hidden md:inline text-xl md:text-2xl font-light text-muted">{restPart}</span>
              </>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-3 min-w-0">
            {activities.length > 0 || companyMenu ? (
              <div className="flex items-center gap-4 border-r border-border pr-3">
                {activities.map((item) => (
                  <NavLinkItem key={`${item.href}-${item.label}`} item={item} />
                ))}
                {companyMenu ? <HeaderNavDropdown label={companyMenu.label} items={companyMenu.items} /> : null}
              </div>
            ) : null}

            {connect.length > 0 ? (
              <div className="flex items-center gap-4 border-r border-border pr-3">
                {connect.map((item) => (
                  <NavLinkItem key={`${item.href}-${item.label}`} item={item} />
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-2 shrink-0">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link href={loggedIn ? "/account" : "/login"} className="text-primary font-semibold text-sm whitespace-nowrap">
                {loggedIn ? accountLabel : loginLabel}
              </Link>
            </div>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button type="button" className="p-2 text-foreground/80" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-surface px-4 py-4 space-y-4">
          {activities.length > 0 ? (
            <div className="space-y-1">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">Trips</p>
              {activities.map((item) => (
                <MobileNavLinkItem key={`${item.href}-${item.label}`} item={item} onNavigate={() => setMobileOpen(false)} />
              ))}
            </div>
          ) : null}

          {companyMenu ? (
            <div>
              <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-muted">Company</p>
              <HeaderNavDropdown
                label={companyMenu.label}
                items={companyMenu.items}
                variant="mobile"
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          ) : null}

          {connect.length > 0 ? (
            <div className="space-y-1">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">Connect</p>
              {connect.map((item) => (
                <MobileNavLinkItem key={`${item.href}-${item.label}`} item={item} onNavigate={() => setMobileOpen(false)} />
              ))}
            </div>
          ) : null}

          <div className="border-t border-border pt-3">
            <Link href={loggedIn ? "/account" : "/login"} className="block text-primary font-semibold py-2" onClick={() => setMobileOpen(false)}>
              {loggedIn ? accountLabel : `${loginLabel} / Register`}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
