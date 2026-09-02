import PageSectionView from "@/components/PageSectionView";
import VisionMissionPageView from "@/components/VisionMissionPageView";
import { getHomeData } from "@/lib/api";
import { getLocalizedSiteContent } from "@/lib/i18n/server-page";
import { getServerLocale } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/seo-server";
import { getPageSectionBySlug } from "@/lib/site-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { site } = await getLocalizedSiteContent();
  const page = getPageSectionBySlug(site, slug);

  if (!page) {
    return createPageMetadata({ title: "Page Not Found", path: `/pages/${slug}`, noIndex: true });
  }

  return createPageMetadata({
    title: page.meta_title,
    description: page.meta_description,
    path: `/pages/${slug}`,
  });
}

export default async function CustomPageSection({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const { site } = await getLocalizedSiteContent();
  const page = getPageSectionBySlug(site, slug);

  if (!page) {
    notFound();
  }

  if (slug === "our-vision" || slug === "our-mission") {
    const homeData = await getHomeData(locale);
    return (
      <VisionMissionPageView page={page} slug={slug} stats={homeData.stats} site={site} />
    );
  }

  return <PageSectionView page={page} slug={slug} site={site} />;
}
