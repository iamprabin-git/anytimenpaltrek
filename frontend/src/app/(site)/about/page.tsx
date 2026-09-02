import AboutPageView from "@/components/AboutPageView";
import { getHomeData } from "@/lib/api";
import { getLocalizedSiteContent } from "@/lib/i18n/server-page";
import { createPageMetadata } from "@/lib/seo-server";
import { getServerLocale } from "@/lib/i18n/server";
import { getPageSectionBySlug } from "@/lib/site-content";
import type { PageSection, SitePageContent } from "@/types/site-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function fallbackAboutSection(page: SitePageContent): PageSection {
  return {
    id: "about",
    slug: "about",
    nav_label: "About Us",
    visible: true,
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    hero_title: page.hero_title,
    hero_subtitle: page.hero_subtitle,
    heading: page.heading,
    paragraphs: page.paragraphs,
    list_title: page.list_title,
    list_items: page.list_items,
    layout: "about",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getLocalizedSiteContent();
  const section = getPageSectionBySlug(site, "about") ?? fallbackAboutSection(site.pages.about);

  return createPageMetadata({
    title: section.meta_title,
    description: section.meta_description,
    path: "/about",
  });
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const [{ site }, homeData] = await Promise.all([getLocalizedSiteContent(), getHomeData(locale)]);
  const section = getPageSectionBySlug(site, "about");

  if (!section && !site.pages.about) {
    notFound();
  }

  const page = section ?? fallbackAboutSection(site.pages.about);

  return <AboutPageView page={page} stats={homeData.stats} site={site} />;
}
