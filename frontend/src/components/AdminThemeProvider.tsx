"use client";

import { useEffect } from "react";
import { getAdminCompanySettings } from "@/lib/admin-api";
import { applyBrandTheme, extractBrandTheme } from "@/lib/brand-theme";
import { useTheme } from "@/components/ThemeProvider";
import { isLoggedInAs } from "@/lib/auth";

export default function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, ready } = useTheme();

  useEffect(() => {
    if (!ready || !isLoggedInAs("admin")) return;

    getAdminCompanySettings()
      .then((data) => {
        applyBrandTheme(
          extractBrandTheme((data.dynamic_settings || null) as Record<string, unknown> | null),
          theme
        );
      })
      .catch(() => {});
  }, [theme, ready]);

  return children;
}
