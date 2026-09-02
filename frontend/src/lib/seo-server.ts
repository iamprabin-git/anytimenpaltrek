import { getCompanySettings, getPackage, getSiteContent } from "@/lib/api";
import { getServerLocale } from "@/lib/i18n/server";
import { buildPageMetadata, packageCategoryPath, type PageSeoInput } from "@/lib/seo";
import type { Metadata } from "next";

export async function getSeoContext() {
  const locale = await getServerLocale();
  const site = await getSiteContent(locale);
  return { locale, site, seo: site.seo };
}

export async function createPageMetadata(page: PageSeoInput): Promise<Metadata> {
  const { seo } = await getSeoContext();
  return buildPageMetadata(seo, page);
}

export async function createPackageMetadata(
  slug: string,
  fallbackPath: string,
  notFoundTitle: string
): Promise<Metadata> {
  try {
    const locale = await getServerLocale();
    const pkg = await getPackage(slug, locale);
    return createPageMetadata({
      title: pkg.title,
      description: pkg.short_description || pkg.description || undefined,
      path: `/${packageCategoryPath(pkg.category)}/${pkg.slug}`,
      image: pkg.image,
    });
  } catch {
    return createPageMetadata({ title: notFoundTitle, path: fallbackPath, noIndex: true });
  }
}

export async function getPublicSeoData() {
  const locale = await getServerLocale();
  const [site, company] = await Promise.all([getSiteContent(locale), getCompanySettings(locale)]);
  return { locale, site, company, seo: site.seo };
}
