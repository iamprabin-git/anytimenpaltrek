import PackageCard from "@/components/PackageCard";
import PageHero from "@/components/PageHero";
import { getPackages } from "@/lib/api";
import { getLocalizedSiteContent } from "@/lib/i18n/server-page";
import { buildSectionCrumbs } from "@/lib/site-breadcrumbs";
import { createPageMetadata } from "@/lib/seo-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getLocalizedSiteContent();
  const page = site.pages.trekking;
  return createPageMetadata({
    title: page.meta_title,
    description: page.meta_description,
    path: "/trekking",
  });
}

export default async function TrekkingPage() {
  const { locale, site } = await getLocalizedSiteContent();
  const packages = await getPackages("trekking", locale);

  return (
    <div>
      <PageHero
        page={site.pages.trekking}
        pageKey="trekking"
        breadcrumbs={buildSectionCrumbs(site.pages.trekking.hero_title || "Trekking", "/trekking")}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
