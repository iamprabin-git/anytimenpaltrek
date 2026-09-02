import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import IndividualPageLayout from "@/components/IndividualPageLayout";
import PageHero from "@/components/PageHero";
import { buildPageCrumbs } from "@/lib/site-breadcrumbs";
import { pageSectionCurrentPath, pageSectionHref } from "@/lib/site-content";
import type { SiteStats } from "@/types";
import type { PageSection, SiteContentMap } from "@/types/site-content";

interface VisionMissionPageViewProps {
  page: PageSection;
  slug: "our-vision" | "our-mission";
  stats: SiteStats;
  site: SiteContentMap;
}

const pillarIcons = ["01", "02", "03", "04", "05", "06"];

export default function VisionMissionPageView({ page, slug, stats, site }: VisionMissionPageViewProps) {
  const isVision = slug === "our-vision";
  const features = page.features || [];
  const listItems = page.list_items || [];
  const leadParagraph = page.paragraphs?.[0] || page.hero_subtitle;
  const supportingParagraphs = page.paragraphs?.slice(1) || [];

  const statItems = [
    { value: `${stats.years_experience}+`, label: "Years Experience" },
    { value: `${stats.reviews_count}+`, label: "Guest Reviews" },
    { value: `${stats.happy_travellers}+`, label: "Happy Travellers" },
    { value: `${stats.packages_count}+`, label: "Curated Journeys" },
  ];

  const sibling = isVision
    ? { href: "/pages/our-mission", label: "Our Mission", eyebrow: "What we do every day" }
    : { href: "/pages/our-vision", label: "Our Vision", eyebrow: "Where we are headed" };

  return (
    <div>
      <PageHero
        page={{ hero_title: page.hero_title, hero_subtitle: page.hero_subtitle }}
        pageKey={slug}
        mainImage={page.main_image}
        galleryImages={page.gallery_images}
        breadcrumbs={buildPageCrumbs(page.nav_label || page.hero_title, pageSectionHref(slug))}
      />

      <section className="relative overflow-hidden bg-[#0b3d35] py-14 text-white md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-white/70">
            {isVision ? "Our North Star" : "Our Promise"}
          </p>
          <blockquote className="text-2xl font-semibold leading-relaxed md:text-4xl md:leading-snug">
            &ldquo;{leadParagraph}&rdquo;
          </blockquote>
        </div>
      </section>

      <section className="border-b border-border bg-[#0f594d] py-8 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 md:grid-cols-4 md:gap-6">
          {statItems.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/15 bg-white/5 px-4 py-5 text-center">
              <p className="text-2xl font-bold md:text-3xl">{item.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-white/75">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <IndividualPageLayout site={site} currentPath={pageSectionCurrentPath(slug)}>
      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface-muted shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
            <div className="relative aspect-[4/3] w-full">
              {page.main_image ? (
                <MediaImage src={page.main_image} alt={page.heading || page.hero_title} fill className="object-cover" />
              ) : (
                <div
                  className={`flex h-full items-center justify-center p-10 text-center text-white ${
                    isVision
                      ? "bg-gradient-to-br from-[#0f594d] via-[#0b3d35] to-[#062923]"
                      : "bg-gradient-to-br from-primary via-primary-dark to-[#0b3d35]"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                      {isVision ? "Vision" : "Mission"}
                    </p>
                    <p className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                      {isVision ? "Responsible Himalayan Travel" : "Service You Can Trust"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 py-5">
              <p className="text-sm font-semibold text-white">{page.hero_subtitle}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">
              {isVision ? "Future Focus" : "Daily Commitment"}
            </p>
            {page.heading ? (
              <h2 className="mb-6 text-3xl font-bold leading-tight text-foreground md:text-4xl">{page.heading}</h2>
            ) : null}
            <div className="space-y-4 text-base leading-relaxed text-muted md:text-lg">
              {supportingParagraphs.length > 0
                ? supportingParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                : page.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </div>
      </section>

      {features.length > 0 ? (
        <section className="bg-[#f7f7f5] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">
                {isVision ? "Guiding Principles" : "How We Deliver"}
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                {isVision ? "The Future We Are Building" : "Standards Behind Every Journey"}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="group rounded-[1.5rem] border border-[#e8e8e8] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,89,77,0.25)]">
                      {pillarIcons[index % pillarIcons.length]}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="leading-relaxed text-muted">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {listItems.length > 0 ? (
        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">
                {isVision ? "Long-Term Goals" : "Operational Commitments"}
              </p>
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                {page.list_title || (isVision ? "What Success Looks Like" : "Our Commitments")}
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                {isVision
                  ? "These priorities shape how we grow as a company and how we welcome every guest to Nepal."
                  : "From the first message to your final day on the trail, these commitments guide our team at every step."}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-white p-8 shadow-[0_16px_48px_rgba(0,0,0,0.07)] md:p-10">
              <ul className="space-y-5">
                {listItems.map((item, index) => (
                  <li key={item} className="flex items-start gap-4 border-b border-border/70 pb-5 last:border-b-0 last:pb-0">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f594d] text-xs font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-1 text-base font-medium leading-relaxed text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-border bg-surface-muted py-12 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">{sibling.eyebrow}</p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Explore {sibling.label}</h2>
            <p className="mt-3 max-w-xl text-muted">
              {isVision
                ? "See how our daily operations, service standards, and guest care bring this vision to life."
                : "Discover the long-term direction that guides our growth, partnerships, and responsible travel goals."}
            </p>
          </div>
          <Link
            href={sibling.href}
            className="inline-flex items-center justify-center rounded-xl border-2 border-primary px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            View {sibling.label}
          </Link>
        </div>
      </section>

      <section className="bg-primary py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Start Planning</p>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            {isVision ? "Turn Inspiration Into Your Next Adventure" : "Experience Our Mission on the Trail"}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/85">
            Speak with our team about treks, tours, and tailor-made itineraries designed around your goals, timeline, and travel style.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary transition hover:bg-white/90">
              Contact Us
            </Link>
            <Link href="/trekking" className="inline-block rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition hover:bg-white hover:text-primary">
              Browse Treks
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white py-10">
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
