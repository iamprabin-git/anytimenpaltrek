import DetailImageGallery from "@/components/DetailImageGallery";
import IndividualPageLayout from "@/components/IndividualPageLayout";
import SiteBreadcrumbs from "@/components/SiteBreadcrumbs";
import LegalDocumentsGrid from "@/components/LegalDocumentsGrid";
import RelatedPageSections from "@/components/RelatedPageSections";
import TeamMembersGrid from "@/components/TeamMembersGrid";
import { buildPageCrumbs } from "@/lib/site-breadcrumbs";
import { getPageHeroFallbackImage } from "@/lib/media";
import { relatedPageSections } from "@/lib/related-content";
import { companyInfoPageSlugs, pageSectionCurrentPath, pageSectionHref, shouldShowIndividualPagesSidebar } from "@/lib/site-content";
import type { PageSection, SiteContentMap } from "@/types/site-content";

interface PageSectionViewProps {
  page: PageSection;
  slug: string;
  site?: SiteContentMap;
}

function pageHeroOverlay(page: PageSection) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-5 text-white">
      <h1 className="mb-2 text-2xl font-bold md:text-4xl">{page.hero_title}</h1>
      <p className="max-w-2xl text-sm text-white/85 md:text-base">{page.hero_subtitle}</p>
    </div>
  );
}

export default function PageSectionView({ page, slug, site }: PageSectionViewProps) {
  const isCompanyInfoPage = site ? companyInfoPageSlugs(site).has(slug) : false;
  const related = site && !isCompanyInfoPage ? relatedPageSections(slug, site.page_sections?.items || []) : [];
  const useTeamLayout = page.layout === "team" || (!page.layout && (page.team_members?.length ?? 0) > 0);
  const useLegalLayout =
    page.layout === "legal" || (!page.layout && !useTeamLayout && (page.legal_documents?.length ?? 0) > 0);
  const useFeaturesLayout =
    !useTeamLayout &&
    !useLegalLayout &&
    (page.layout === "features" || (!page.layout && (page.features?.length ?? 0) > 0));
  const hasContent =
    page.heading ||
    (page.paragraphs?.length ?? 0) > 0 ||
    (page.list_items?.length ?? 0) > 0;
  const showSidebar = shouldShowIndividualPagesSidebar(slug);

  const pageBody = (
    <>
      {useTeamLayout && page.team_members?.length ? (
        <>
          {hasContent ? (
            <section className="py-6 sm:py-8 md:py-10">
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                {page.heading ? <h2>{page.heading}</h2> : null}
                {page.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : null}
          <TeamMembersGrid members={page.team_members} teamPageSlug={slug} />
        </>
      ) : null}

      {useLegalLayout && page.legal_documents?.length ? (
        <>
          {hasContent ? (
            <section className="py-6 sm:py-8 md:py-10">
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                {page.heading ? <h2>{page.heading}</h2> : null}
                {page.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : null}
          <LegalDocumentsGrid documents={page.legal_documents} />
        </>
      ) : null}

      {useFeaturesLayout && page.features?.length ? (
        <section className="py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {page.features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-surface p-6 shadow-md card-hover sm:p-8">
                <h3 className="mb-3 text-lg font-bold text-foreground sm:text-xl">{feature.title}</h3>
                <p className="leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {hasContent && !useTeamLayout && !useLegalLayout ? (
        <section className="py-8 sm:py-12 md:py-16">
          <div className={`prose prose-sm sm:prose-base lg:prose-lg ${showSidebar ? "max-w-none" : "mx-auto max-w-3xl"}`}>
            {page.heading ? <h2>{page.heading}</h2> : null}
            {page.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {page.list_title ? <h3>{page.list_title}</h3> : null}
            {page.list_items ? (
              <ul>
                {page.list_items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="pb-16">
          <RelatedPageSections pages={related} />
        </section>
      ) : null}
    </>
  );

  return (
    <div>
      <DetailImageGallery
        mainImage={page.main_image}
        galleryImages={page.gallery_images}
        pageKey={slug}
        fallbackImage={getPageHeroFallbackImage(slug)}
        alt={page.hero_title}
        variant="hero"
        overlay={pageHeroOverlay(page)}
      />

      <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-3 sm:py-4">
        <SiteBreadcrumbs
          items={buildPageCrumbs(page.nav_label || page.hero_title, pageSectionHref(slug))}
          className="min-w-0 whitespace-nowrap sm:whitespace-normal"
        />
      </div>

      {showSidebar ? (
        <IndividualPageLayout site={site} currentPath={pageSectionCurrentPath(slug)}>
          {pageBody}
        </IndividualPageLayout>
      ) : (
        <div className="mx-auto max-w-7xl px-4 pb-16">{pageBody}</div>
      )}
    </div>
  );
}
