import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import IndividualPageLayout from "@/components/IndividualPageLayout";
import PageHero from "@/components/PageHero";
import { buildPageCrumbs } from "@/lib/site-breadcrumbs";
import type { SiteStats } from "@/types";
import type { PageSection, SiteContentMap } from "@/types/site-content";

interface AboutPageViewProps {
  page: PageSection;
  stats: SiteStats;
  site: SiteContentMap;
}

const valueIcons = ["01", "02", "03", "04", "05", "06"];

export default function AboutPageView({ page, stats, site }: AboutPageViewProps) {
  const features = page.features || [];
  const listItems = page.list_items || [];

  const statItems = [
    { value: `${stats.years_experience}+`, label: "Years Experience" },
    { value: `${stats.reviews_count}+`, label: "Reviews" },
    { value: `${stats.happy_travellers}+`, label: "Happy Travellers" },
    { value: `${stats.packages_count}+`, label: "Trip Packages" },
  ];

  return (
    <div>
      <PageHero
        page={{ hero_title: page.hero_title, hero_subtitle: page.hero_subtitle }}
        pageKey="about"
        mainImage={page.main_image}
        galleryImages={page.gallery_images}
        breadcrumbs={buildPageCrumbs(page.nav_label || page.hero_title, "/about")}
      />

      <section className="bg-[#0f594d] py-10 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {statItems.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/15 bg-white/5 px-4 py-5 text-center">
              <p className="text-3xl font-bold md:text-4xl">{item.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/75">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <IndividualPageLayout site={site} currentPath="/about">
      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <div className="relative aspect-[4/3] w-full">
              {page.main_image ? (
                <MediaImage src={page.main_image} alt={page.heading || page.hero_title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-8 text-center text-white">
                  <div>
                    <p className="text-5xl font-bold">{stats.years_experience}+</p>
                    <p className="mt-3 text-lg font-semibold uppercase tracking-wide">Years Guiding in Nepal</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">Who We Are</p>
            {page.heading ? <h2 className="mb-6 text-3xl font-bold leading-tight text-foreground md:text-4xl">{page.heading}</h2> : null}
            <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
              {(page.paragraphs || []).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {features.length > 0 ? (
        <section className="bg-[#f5f5f5] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">Our Approach</p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">What We Stand For</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-[#e8e8e8] bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {valueIcons[index % valueIcons.length]}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="leading-relaxed text-muted">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {listItems.length > 0 ? (
        <section className="py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">Why Travel With Us</p>
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">{page.list_title || "Why Choose Us?"}</h2>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                From your first inquiry to your return home, we focus on safety, transparency, and authentic experiences across every trek and tour.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] md:p-10">
              <ul className="space-y-5">
                {listItems.map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      ✓
                    </span>
                    <span className="pt-1 font-medium leading-relaxed text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-primary py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Plan Your Journey</p>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Experience Nepal?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/85">
            Talk with our team about treks, tours, and custom itineraries tailored to your dates, budget, and adventure style.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary transition hover:bg-white/90">
              Contact Us
            </Link>
            <Link href="/tours" className="inline-block rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white hover:text-primary">
              View Packages
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-muted py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 text-center text-sm font-semibold uppercase tracking-wide text-[#0a7b83] md:gap-10">
          <span>Licensed Tourism Company</span>
          <span className="hidden h-4 w-px bg-border md:block" />
          <span>Tourism License No. 2083</span>
          <span className="hidden h-4 w-px bg-border md:block" />
          <span>Company Registration No. 132626</span>
        </div>
      </section>
      </IndividualPageLayout>
    </div>
  );
}
