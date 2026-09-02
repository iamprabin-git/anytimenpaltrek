import PageSectionView from "@/components/PageSectionView";
import { getLocalizedSiteContent } from "@/lib/i18n/server-page";
import { createPageMetadata } from "@/lib/seo-server";
import { getPageSectionBySlug } from "@/lib/site-content";
import type { PageSection } from "@/types/site-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

function fallbackWhyUsSection(page: import("@/types/site-content").SitePageContent): PageSection {
  return {
    id: "why-us",
    slug: "why-us",
    nav_label: "Why Us",
    visible: true,
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    hero_title: page.hero_title,
    hero_subtitle: page.hero_subtitle,
    features: page.features,
    layout: "features",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getLocalizedSiteContent();
  const section = getPageSectionBySlug(site, "why-us") ?? fallbackWhyUsSection(site.pages.why_us);

  return createPageMetadata({
    title: section.meta_title,
    description: section.meta_description,
    path: "/why-us",
  });
}

export default async function WhyUsPage() {
  const { site } = await getLocalizedSiteContent();
  const section = getPageSectionBySlug(site, "why-us");

  if (!section && !site.pages.why_us) {
    notFound();
  }

  const page = section ?? fallbackWhyUsSection(site.pages.why_us);

  return <PageSectionView page={page} slug="why-us" site={site} />;
}
