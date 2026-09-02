import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/api";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let siteUrl = getSiteUrl();

  try {
    const site = await getSiteContent(DEFAULT_LOCALE);
    siteUrl = getSiteUrl(site.seo);
  } catch {
    // use env fallback
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/agent/",
          "/account/",
          "/login",
          "/auth/",
          "/book/",
          "/payment/",
          "/api/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml", { site_url: siteUrl }),
    host: siteUrl,
  };
}
