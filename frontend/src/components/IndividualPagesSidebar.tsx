"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { isSidebarLinkActive } from "@/lib/site-content";
import type { SidebarNavGroup } from "@/lib/site-content";

interface IndividualPagesSidebarProps {
  groups: SidebarNavGroup[];
  currentPath: string;
}

function linkClassName(active: boolean, nested = false) {
  return [
    "block border-b border-border/80 px-4 py-3 text-sm leading-snug transition-colors last:border-b-0",
    nested ? "pl-8 text-[13px]" : "",
    active
      ? "bg-primary/10 font-semibold text-primary"
      : "text-foreground/85 hover:bg-surface-muted hover:text-primary",
  ]
    .filter(Boolean)
    .join(" ");
}

function findActiveLabel(groups: SidebarNavGroup[], currentPath: string) {
  for (const group of groups) {
    for (const item of group.items) {
      if (isSidebarLinkActive(currentPath, item.href)) {
        return item.label;
      }

      const child = item.children?.find((entry) => isSidebarLinkActive(currentPath, entry.href));
      if (child) {
        return child.label;
      }
    }
  }

  return "Browse pages";
}

function SidebarNav({ groups, currentPath }: IndividualPagesSidebarProps) {
  return (
    <>
      {groups.map((group, groupIndex) => (
        <div key={group.heading} className={groupIndex > 0 ? "border-t border-border" : ""}>
          <div className="bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-white">
            {group.heading}
          </div>
          <nav className="max-h-[50vh] overflow-y-auto lg:max-h-[640px]">
            {group.items.map((item) => {
              const childActive = item.children?.some((child) => isSidebarLinkActive(currentPath, child.href));
              const itemActive = isSidebarLinkActive(currentPath, item.href) || Boolean(childActive);

              return (
                <div key={item.href}>
                  <Link href={item.href} className={linkClassName(itemActive && !childActive)}>
                    {item.label}
                  </Link>
                  {item.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={linkClassName(isSidebarLinkActive(currentPath, child.href), true)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </nav>
        </div>
      ))}
    </>
  );
}

export default function IndividualPagesSidebar({ groups, currentPath }: IndividualPagesSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel = useMemo(() => findActiveLabel(groups, currentPath), [groups, currentPath]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <aside className="w-full shrink-0 lg:w-72 xl:w-80">
      <button
        type="button"
        onClick={() => setMobileOpen((value) => !value)}
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left shadow-sm lg:hidden"
        aria-expanded={mobileOpen}
        aria-controls="individual-pages-sidebar-nav"
      >
        <span className="min-w-0 pr-3">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted">Page menu</span>
          <span className="block truncate text-sm font-semibold text-foreground">{activeLabel}</span>
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-primary transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id="individual-pages-sidebar-nav"
        className={`overflow-hidden rounded-lg border border-border bg-surface shadow-md ${mobileOpen ? "block" : "hidden"} lg:block lg:sticky lg:top-24`}
      >
        <SidebarNav groups={groups} currentPath={currentPath} />
      </div>
    </aside>
  );
}
