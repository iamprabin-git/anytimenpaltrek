"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandThemeProvider from "@/components/BrandThemeProvider";
import { SiteContentProvider } from "@/components/SiteContentProvider";
import { LocaleProvider } from "@/lib/i18n/context";
import type { LocaleCode } from "@/lib/i18n/locales";

export default function SiteChrome({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: LocaleCode;
}) {
  const pathname = usePathname();
  const hideChrome =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/account") ||
    pathname === "/login" ||
    pathname.startsWith("/login/");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <LocaleProvider initialLocale={initialLocale}>
      <SiteContentProvider>
        <BrandThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </BrandThemeProvider>
      </SiteContentProvider>
    </LocaleProvider>
  );
}
