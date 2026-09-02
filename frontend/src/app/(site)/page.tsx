import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import PackageCard from "@/components/PackageCard";
import DestinationCards from "@/components/DestinationCards";
import BestSelling from "@/components/BestSelling";
import SeasonTrip from "@/components/SeasonTrip";
import AboutSection from "@/components/AboutSection";
import ReviewsSection from "@/components/ReviewsSection";
import AffiliationBanner from "@/components/AffiliationBanner";
import BlogSection from "@/components/BlogSection";
import { createPageMetadata } from "@/lib/seo-server";
import { getHomeData } from "@/lib/api";
import { getServerLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Tours and Trekking in Nepal",
    description: undefined,
    path: "/",
  });
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const data = await getHomeData(locale);
  const home = data.site_content?.home;

  if (!home) {
    return <p className="p-8 text-center text-muted">Homepage content is not configured yet.</p>;
  }

  return (
    <>
      <HeroSlider slides={data.hero_slides} />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">{home.featured.title}</h2>
            {home.featured.subtitle ? <p className="section-subtitle">{home.featured.subtitle}</p> : null}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.featured_packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          {home.featured.cta_text && home.featured.cta_link ? (
            <div className="text-center mt-10">
              <Link href={home.featured.cta_link} className="btn-primary">
                {home.featured.cta_text}
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <DestinationCards destinations={data.destinations} copy={home.destinations} />
      <BestSelling packages={data.best_selling} copy={home.best_selling} />
      <SeasonTrip pkg={data.season_pick} copy={home.season} />
      <AboutSection copy={home.about} stats={data.stats} />
      <ReviewsSection reviews={data.reviews} stats={data.stats} copy={home.reviews} />
      <BlogSection posts={data.blog_posts} copy={home.blog} />
      <AffiliationBanner badges={data.site_content?.footer?.affiliation_badges || []} />
    </>
  );
}
