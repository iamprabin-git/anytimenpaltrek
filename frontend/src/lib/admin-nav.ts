import type { PanelIconName } from "@/components/panel/icons";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: PanelIconName;
  exact?: boolean;
  description?: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: "dashboard",
        exact: true,
        description: "Company metrics and quick actions",
      },
    ],
  },
  {
    title: "Team & Access",
    items: [
      { href: "/admin/agents", label: "Agents", icon: "users", description: "Manage agent accounts" },
      { href: "/admin/roles", label: "Role Permissions", icon: "shield", description: "Control agent capabilities" },
    ],
  },
  {
    title: "Brand & Content",
    items: [
      { href: "/admin/appearance", label: "Appearance", icon: "palette", description: "Colors, fonts, and social links" },
      { href: "/admin/settings", label: "Company Settings", icon: "building", description: "Logo, contact, and licenses" },
      { href: "/admin/content", label: "Site Content", icon: "layout", description: "Pages, footer, and navigation copy" },
      { href: "/admin/home-content", label: "Home Content", icon: "layers", description: "Hero slides and destinations" },
    ],
  },
];

export const ADMIN_SHORTCUTS = ADMIN_NAV_SECTIONS.flatMap((section) => section.items).filter(
  (item) => item.href !== "/admin"
);

export function getAdminPageMeta(pathname: string) {
  for (const section of ADMIN_NAV_SECTIONS) {
    for (const item of section.items) {
      const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
      if (active) {
        return {
          title: item.label,
          description: item.description || "Administration",
          section: section.title,
        };
      }
    }
  }

  if (pathname.startsWith("/admin/profile")) {
    return { title: "My Profile", description: "Account settings", section: "Account" };
  }

  return { title: "Admin Panel", description: "Company management", section: "Overview" };
}
