import type { PanelIconName } from "@/components/panel/icons";
import type { NavSection } from "@/components/PanelShell";
import { hasPermission, type AuthUser } from "@/lib/auth";

export type AgentNavItem = {
  href: string;
  label: string;
  icon: PanelIconName;
  permission: string;
  exact?: boolean;
  note?: string;
};

export const AGENT_NAV_SECTIONS: Array<{ title: string; items: AgentNavItem[] }> = [
  {
    title: "Overview",
    items: [
      { href: "/agent", label: "Dashboard", icon: "dashboard", permission: "dashboard.view", exact: true },
      {
        href: "/agent/analytics",
        label: "Analytics",
        icon: "layout",
        permission: "analytics.view",
        note: "Sales, conversions, and revenue performance",
      },
      { href: "/agent/profile", label: "My Profile", icon: "profile", permission: "profile.view" },
    ],
  },
  {
    title: "Customers & CRM",
    items: [
      {
        href: "/agent/users",
        label: "Customer Management",
        icon: "users",
        permission: "users.view",
        note: "Profiles, approvals, and contact details",
      },
      {
        href: "/agent/crm",
        label: "CRM Dashboard",
        icon: "layers",
        permission: "crm.view",
        note: "Interactions, loyalty, and engagement overview",
      },
      {
        href: "/agent/crm/customers",
        label: "Customer Insights",
        icon: "heart",
        permission: "crm.view",
        note: "Timelines linked to customer profiles",
      },
      {
        href: "/agent/crm/campaigns",
        label: "Marketing Campaigns",
        icon: "inbox",
        permission: "crm.campaigns.view",
        note: "Multi-channel deals and promotions",
      },
      {
        href: "/agent/crm/email-marketing",
        label: "Email Marketing",
        icon: "inbox",
        permission: "crm.campaigns.view",
        note: "Send campaigns to customer emails",
      },
      {
        href: "/agent/crm/whatsapp-marketing",
        label: "WhatsApp Marketing",
        icon: "inbox",
        permission: "crm.campaigns.view",
        note: "Personalized WhatsApp outreach links",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/agent/approvals",
        label: "Change Approvals",
        icon: "inbox",
        permission: "approvals.view",
        note: "Approve accountant and reception changes",
      },
      {
        href: "/agent/payment-settings",
        label: "Payment QR & Bank",
        icon: "payments",
        permission: "payment_settings.view",
        note: "Manage QR code and bank details",
      },
      {
        href: "/agent/payments",
        label: "Booking List",
        icon: "payments",
        permission: "bookings.view",
        note: "Approve, export, and print bookings",
      },
      {
        href: "/agent/inquiries",
        label: "Inquiry Management",
        icon: "inbox",
        permission: "inquiries.view",
        note: "Handle contact inquiries",
      },
      {
        href: "/agent/reviews",
        label: "Review Management",
        icon: "star",
        permission: "reviews.view",
        note: "Moderate customer reviews",
      },
    ],
  },
  {
    title: "Travel & Content",
    items: [
      {
        href: "/agent/treks",
        label: "Trek Management",
        icon: "map",
        permission: "packages.view",
        note: "Manage trekking packages",
      },
      {
        href: "/agent/tours",
        label: "Tour Management",
        icon: "map",
        permission: "packages.view",
        note: "Manage tour and adventure packages",
      },
      {
        href: "/agent/blog",
        label: "Blog Management",
        icon: "inbox",
        permission: "blog.view",
        note: "Create and publish blog posts",
      },
    ],
  },
];

export const AGENT_ROUTE_PERMISSIONS: Record<string, string> = {
  "/agent": "dashboard.view",
  "/agent/analytics": "analytics.view",
  "/agent/profile": "profile.view",
  "/agent/approvals": "approvals.view",
  "/agent/users": "users.view",
  "/agent/payment-settings": "payment_settings.view",
  "/agent/payments": "bookings.view",
  "/agent/bookings": "bookings.view",
  "/agent/inquiries": "inquiries.view",
  "/agent/reviews": "reviews.view",
  "/agent/crm": "crm.view",
  "/agent/crm/customers": "crm.view",
  "/agent/crm/campaigns": "crm.campaigns.view",
  "/agent/crm/email-marketing": "crm.campaigns.view",
  "/agent/crm/whatsapp-marketing": "crm.campaigns.view",
  "/agent/treks": "packages.view",
  "/agent/tours": "packages.view",
  "/agent/blog": "blog.view",
  "/agent/packages": "packages.view",
};

export const AGENT_DASHBOARD_STATS: Array<{ key: string; label: string; permission: string }> = [
  { key: "packages", label: "Packages", permission: "packages.view" },
  { key: "pending_users", label: "Pending Users", permission: "users.view" },
  { key: "active_users", label: "Active Users", permission: "users.view" },
  { key: "pending_reviews", label: "Pending Reviews", permission: "reviews.view" },
  { key: "new_inquiries", label: "New Inquiries", permission: "inquiries.view" },
  { key: "pending_bookings", label: "Pending Bookings", permission: "bookings.view" },
  { key: "paid_bookings", label: "Paid Bookings", permission: "bookings.view" },
  { key: "active_customers", label: "Active Customers", permission: "crm.view" },
  { key: "loyalty_members", label: "Loyalty Members", permission: "crm.view" },
  { key: "draft_campaigns", label: "Draft Campaigns", permission: "crm.campaigns.view" },
];

export function getAgentRoutePermission(pathname: string): string | null {
  if (pathname === "/agent/login" || pathname === "/agent") {
    return null;
  }

  const routes = Object.entries(AGENT_ROUTE_PERMISSIONS)
    .filter(([path]) => path !== "/agent")
    .sort((a, b) => b[0].length - a[0].length);

  for (const [path, permission] of routes) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return permission;
    }
  }

  return null;
}

export function filterAgentNavSections(user: AuthUser | null): NavSection[] {
  const sections: NavSection[] = [];

  for (const group of AGENT_NAV_SECTIONS) {
    const items = group.items
      .filter((entry) => hasPermission(entry.permission, user))
      .map(({ href, label, icon, exact }) => ({ href, label, icon, exact }));

    if (items.length > 0) {
      sections.push({ title: group.title, items });
    }
  }

  return sections;
}

export function getAllowedAgentQuickLinks(user: AuthUser | null) {
  return AGENT_NAV_SECTIONS.flatMap((group) => group.items).filter(
    (entry) => entry.href !== "/agent" && hasPermission(entry.permission, user)
  );
}

export function firstAllowedAgentHref(user: AuthUser | null): string | null {
  for (const group of AGENT_NAV_SECTIONS) {
    for (const entry of group.items) {
      if (hasPermission(entry.permission, user)) {
        return entry.href;
      }
    }
  }

  return null;
}

export function canAccessAgentRoute(pathname: string, user: AuthUser | null): boolean {
  const permission = getAgentRoutePermission(pathname);
  if (!permission) {
    return true;
  }

  return hasPermission(permission, user);
}
