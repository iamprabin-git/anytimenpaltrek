import DetailImageGallery from "@/components/DetailImageGallery";
import SiteBreadcrumbs from "@/components/SiteBreadcrumbs";
import type { BreadcrumbItem } from "@/lib/site-breadcrumbs";
import type { SitePageContent } from "@/types/site-content";

export type PageHeroContent = Pick<SitePageContent, "hero_title" | "hero_subtitle">;

interface PageHeroProps {
  page: PageHeroContent;
  pageKey?: string;
  mainImage?: string | null;
  galleryImages?: string[] | null;
  breadcrumbs?: BreadcrumbItem[];
}

export default function PageHero({ page, pageKey, mainImage, galleryImages, breadcrumbs }: PageHeroProps) {
  return (
    <>
      <DetailImageGallery
        mainImage={mainImage}
        galleryImages={galleryImages}
        pageKey={pageKey}
        alt={page.hero_title}
        variant="hero"
        overlay={
          <div className="mx-auto w-full max-w-7xl px-4 pb-5 text-white">
            <h1 className="mb-2 text-2xl font-bold md:text-4xl">{page.hero_title}</h1>
            <p className="max-w-2xl text-sm text-white/85 md:text-base">{page.hero_subtitle}</p>
          </div>
        }
      />
      {breadcrumbs?.length ? (
        <div className="mx-auto max-w-7xl px-4 py-4">
          <SiteBreadcrumbs items={breadcrumbs} />
        </div>
      ) : null}
    </>
  );
}
