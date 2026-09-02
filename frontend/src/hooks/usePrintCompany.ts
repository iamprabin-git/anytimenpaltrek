"use client";

import { useEffect, useState } from "react";
import { getCompanySettings } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import type { CompanySettings } from "@/types";

async function preloadLogoDataUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return url;

    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : url);
      reader.onerror = () => reject(new Error("Failed to read logo"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

export function usePrintCompany() {
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanySettings()
      .then(async (settings) => {
        setCompany(settings);
        const url = resolveMediaUrl(settings.logo_url || settings.logo);
        if (url) {
          setLogoSrc(await preloadLogoDataUrl(url));
        }
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  return { company, logoSrc, loading };
}
