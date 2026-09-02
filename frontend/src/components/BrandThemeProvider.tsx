"use client";

import { useEffect } from "react";
import { applyBrandTheme, extractBrandTheme } from "@/lib/brand-theme";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useTheme } from "@/components/ThemeProvider";

export default function BrandThemeProvider({ children }: { children: React.ReactNode }) {
  const { company } = useSiteContent();
  const { theme, ready } = useTheme();

  useEffect(() => {
    if (!ready) return;

    const brandTheme = extractBrandTheme((company?.dynamic_settings || null) as Record<string, unknown> | null);
    applyBrandTheme(brandTheme, theme);
  }, [company, theme, ready]);

  return children;
}
