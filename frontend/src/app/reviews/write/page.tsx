import PageHero from "@/components/PageHero";
import ReviewForm from "@/components/ReviewForm";
import { buildPageCrumbs } from "@/lib/site-breadcrumbs";
import { getLocalizedSiteContent } from "@/lib/i18n/server-page";
import { createPageMetadata } from "@/lib/seo-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getLocalizedSiteContent();
  const page = site.pages.reviews_write;

  return createPageMetadata({
    title: page.meta_title,
    description: page.meta_description,
    path: "/reviews/write",
  });
}

export default async function WriteReviewPage() {
  const { site } = await getLocalizedSiteContent();

  return (
    <div>
      <PageHero
        page={site.pages.reviews_write}
        pageKey="reviews_write"
        breadcrumbs={buildPageCrumbs(site.pages.reviews_write.hero_title || "Write a Review", "/reviews/write")}
      />

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <ReviewForm />
        </div>
      </section>
    </div>
  );
}
