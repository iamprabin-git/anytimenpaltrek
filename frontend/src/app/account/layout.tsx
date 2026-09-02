import UserShell from "@/components/UserShell";
import { PRIVATE_ROBOTS } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  robots: PRIVATE_ROBOTS,
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <UserShell>{children}</UserShell>;
}
