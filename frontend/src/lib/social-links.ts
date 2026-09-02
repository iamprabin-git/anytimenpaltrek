import { SOCIAL_PLATFORMS } from "@/components/SocialNetworkIcon";

export interface CompanySocialLink {
  id: string;
  platform: string;
  href: string;
}

const DEFAULT_PLATFORMS = ["facebook", "instagram", "twitter", "linkedin", "youtube"] as const;

function platformLabel(platform: string) {
  return SOCIAL_PLATFORMS.find((item) => item.value === platform)?.label || platform;
}

function platformSortIndex(platform: string) {
  const index = SOCIAL_PLATFORMS.findIndex((item) => item.value === platform);
  return index === -1 ? 999 : index;
}

export function parseCompanySocialLinks(dynamic: Record<string, unknown> | null | undefined): CompanySocialLink[] {
  const settings = dynamic || {};
  const found = Object.entries(settings)
    .filter(([key, value]) => key.startsWith("social_") && typeof value === "string")
    .map(([key, value]) => ({
      id: key,
      platform: key.replace(/^social_/, ""),
      href: String(value),
    }))
    .sort((a, b) => platformSortIndex(a.platform) - platformSortIndex(b.platform));

  if (found.length > 0) {
    return found;
  }

  return DEFAULT_PLATFORMS.map((platform) => ({
    id: `social_${platform}`,
    platform,
    href: "",
  }));
}

export function serializeCompanySocialLinks(links: CompanySocialLink[]): Record<string, string> {
  const payload: Record<string, string> = {};

  for (const link of links) {
    if (!link.platform) continue;
    payload[`social_${link.platform}`] = link.href;
  }

  return payload;
}

export function stripCompanySocialKeys(dynamic: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(dynamic).filter(([key]) => !key.startsWith("social_")));
}

export function createCompanySocialLink(platform: string, href = ""): CompanySocialLink {
  return {
    id: `social_${platform}_${Date.now()}`,
    platform,
    href,
  };
}

export function nextAvailableSocialPlatform(usedPlatforms: string[]) {
  const used = new Set(usedPlatforms);
  return SOCIAL_PLATFORMS.find((platform) => !used.has(platform.value)) || null;
}

export function socialLinkLabel(platform: string) {
  return platformLabel(platform);
}

export function toFooterSocialLinks(dynamic: Record<string, unknown> | null | undefined) {
  return parseCompanySocialLinks(dynamic)
    .filter((link) => link.href.trim())
    .map((link) => ({
      key: link.platform,
      label: platformLabel(link.platform),
      href: link.href.trim(),
    }));
}
