import type { CompanySettings } from "@/types";

export interface SisterCompany {
  id: string;
  name: string;
  description?: string;
  website?: string;
  location?: string;
  logo?: string;
  visible?: boolean;
}

export function parseSisterCompanies(raw: unknown): SisterCompany[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item): SisterCompany | null => {
      if (!item || typeof item !== "object") return null;
      const company = item as Record<string, unknown>;
      const name = String(company.name || "").trim();
      if (!name) return null;

      return {
        id: String(company.id || name.toLowerCase().replace(/\s+/g, "-")),
        name,
        description: String(company.description || "").trim() || undefined,
        website: String(company.website || "").trim() || undefined,
        location: String(company.location || "").trim() || undefined,
        logo: String(company.logo || "").trim() || undefined,
        visible: company.visible === false ? false : true,
      };
    })
    .filter((item): item is SisterCompany => item !== null);
}

export function getContactMapEmbedUrl(company: CompanySettings | null): string | null {
  const dynamic = company?.dynamic_settings || {};
  const configured = String(dynamic.contact_map_embed_url || "").trim();
  if (configured) {
    return configured;
  }

  const address = String(company?.address || "").trim();
  if (!address) {
    return null;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export function googleMapsDirectionsUrl(address: string) {
  const trimmed = address.trim();
  if (!trimmed) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}
