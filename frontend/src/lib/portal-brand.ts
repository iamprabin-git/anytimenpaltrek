import { getLocalizedCompanySettings } from "@/lib/i18n/server-page";
import { resolveMediaUrl } from "@/lib/media";
import type { CompanySettings } from "@/types";

export const DEFAULT_COMPANY_NAME = "Anytime Nepal Trek";

export interface PortalBrand {
  companyName: string;
  logoUrl: string | null;
  tagline: string | null;
}

export function getPortalBrand(company: CompanySettings | null | undefined): PortalBrand {
  const companyName = company?.company_name?.trim() || DEFAULT_COMPANY_NAME;
  const logoUrl = resolveMediaUrl(company?.logo_url || company?.logo) || null;
  const taglineRaw = company?.dynamic_settings?.tagline;
  const tagline = typeof taglineRaw === "string" && taglineRaw.trim() ? taglineRaw.trim() : null;

  return { companyName, logoUrl, tagline };
}

export async function loadPortalBrand(): Promise<PortalBrand> {
  const company = await getLocalizedCompanySettings();
  return getPortalBrand(company);
}
