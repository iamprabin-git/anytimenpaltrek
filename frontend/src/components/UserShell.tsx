"use client";

import PanelShell from "@/components/PanelShell";
import { getAuthUser } from "@/lib/auth";

const accountMenu = [
  { href: "/account", label: "Profile", icon: "profile" as const, exact: true },
  { href: "/account/bookings", label: "My Bookings", icon: "calendar" as const },
  { href: "/account/payments", label: "My Payment", icon: "payments" as const },
  { href: "/account/contact-staff", label: "Contact to Staff", icon: "inbox" as const },
  { href: "/account/wishlist", label: "My Wishlist", icon: "heart" as const },
  { href: "/account/suggestions", label: "Suggestion", icon: "star" as const },
  { href: "/account/photos", label: "My Photo Upload", icon: "camera" as const },
  { href: "/reviews/write", label: "Write Review", icon: "pen" as const },
];

export default function UserShell({ children }: { children: React.ReactNode }) {
  const user = getAuthUser();

  return (
    <PanelShell
      role="user"
      title="My Account"
      subtitle={user?.name || "Customer portal"}
      navItems={accountMenu}
    >
      {children}
    </PanelShell>
  );
}
