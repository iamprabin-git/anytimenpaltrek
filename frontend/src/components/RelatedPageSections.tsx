import MediaImage from "@/components/MediaImage";
import RelatedSection from "@/components/RelatedSection";
import Link from "next/link";
import { hasMediaSrc } from "@/lib/media";
import type { PageSection } from "@/types/site-content";

export default function RelatedPageSections({ pages }: { pages: PageSection[] }) {
  if (pages.length === 0) return null;

  return (
    <RelatedSection
      title="Related Pages"
      subtitle="Explore more information and helpful pages across our website."
      viewAllHref="/"
      viewAllLabel="Back to home →"
      className="mx-auto max-w-7xl px-4"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/pages/${page.slug}`}
            className="group block overflow-hidden rounded-xl border border-border bg-surface shadow-sm card-hover"
          >
            <div className="relative h-44 overflow-hidden">
              {hasMediaSrc(page.main_image) ? (
                <MediaImage
                  src={page.main_image}
                  alt={page.hero_title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-surface-muted text-sm text-muted">No image</div>
              )}
            </div>
            <div className="p-5">
              <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                {page.hero_title}
              </h3>
              {page.hero_subtitle ? (
                <p className="mt-2 line-clamp-3 text-sm text-muted">{page.hero_subtitle}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </RelatedSection>
  );
}
