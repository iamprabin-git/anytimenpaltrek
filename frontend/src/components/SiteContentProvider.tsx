"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CompanySettings } from "@/types";
import type { SiteContentMap } from "@/types/site-content";
import { useLocale } from "@/lib/i18n/context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface SiteContextValue {
  site: SiteContentMap | null;
  company: CompanySettings | null;
  loading: boolean;
}

const SiteContext = createContext<SiteContextValue>({
  site: null,
  company: null,
  loading: true,
});

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [site, setSite] = useState<SiteContentMap | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${API_URL}/site-content?locale=${locale}`, {
        headers: { Accept: "application/json", "X-Locale": locale },
        cache: "no-store",
      }).then((res) => res.json()),
      fetch(`${API_URL}/company-settings?locale=${locale}`, {
        headers: { Accept: "application/json", "X-Locale": locale },
        cache: "no-store",
      }).then((res) => res.json()),
    ])
      .then(([siteResponse, companySettings]) => {
        setSite((siteResponse.content || siteResponse) as SiteContentMap);
        setCompany(companySettings as CompanySettings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  return <SiteContext.Provider value={{ site, company, loading }}>{children}</SiteContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContext);
}
