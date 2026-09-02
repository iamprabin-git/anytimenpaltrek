import type { Metadata } from "next";
import type { SiteSeoContent } from "@/types/site-content";
import { resolveMediaUrl } from "@/lib/media";

export interface PageSeoInput {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
}

export function getSiteUrl(seo?: Pick<SiteSeoContent, "site_url">): string {
  const configured = seo?.site_url?.trim();
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_URL?.trim();

  const raw = configured || fromEnv || "http://localhost:3000";
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;

  return withProtocol.replace(/\/$/, "");
}

export function absoluteUrl(path = "/", seo?: Pick<SiteSeoContent, "site_url">): string {
  const base = getSiteUrl(seo);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function resolveOgImage(image?: string | null): string | undefined {
  return resolveMediaUrl(image) || undefined;
}

function parseKeywords(keywords?: string): string[] | undefined {
  if (!keywords?.trim()) return undefined;
  return keywords
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function packageCategoryPath(category: string): string {
  if (category === "trekking") return "trekking";
  if (category === "tour") return "tours";
  return "adventure";
}

export function buildRootMetadata(seo: SiteSeoContent): Metadata {
  const siteUrl = getSiteUrl(seo);
  const ogImage = resolveOgImage(seo.default_og_image);
  const keywords = parseKeywords(seo.keywords);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.site_name,
      template: seo.title_template,
    },
    description: seo.default_description,
    keywords,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: seo.site_name,
      title: seo.site_name,
      description: seo.default_description,
      ...(ogImage ? { images: [{ url: ogImage, alt: seo.site_name }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: seo.site_name,
      description: seo.default_description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function buildPageMetadata(seo: SiteSeoContent, page: PageSeoInput): Metadata {
  const title = page.title;
  const description = page.description || seo.default_description;
  const url = page.path ? absoluteUrl(page.path, seo) : getSiteUrl(seo);
  const ogImage = resolveOgImage(page.image) || resolveOgImage(seo.default_og_image);
  const keywords = parseKeywords(seo.keywords);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: seo.site_name,
      type: page.type || "website",
      locale: "en_US",
      ...(ogImage ? { images: [{ url: ogImage, alt: title }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: page.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
          },
        },
  };
}

export const PRIVATE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};
