import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import IndividualPageLayout from "@/components/IndividualPageLayout";
import PageHero from "@/components/PageHero";
import SocialNetworkIcon from "@/components/SocialNetworkIcon";
import { buildTeamMemberCrumbs } from "@/lib/site-breadcrumbs";
import { pageSectionHref, teamMemberBiographyParagraphs, teamMemberProfileHref } from "@/lib/site-content";
import type { PageSection, SiteContentMap, TeamMember } from "@/types/site-content";

interface TeamMemberProfileViewProps {
  page: PageSection;
  member: TeamMember;
  site: SiteContentMap;
}

function whatsappHref(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : value;
}

export default function TeamMemberProfileView({ page, member, site }: TeamMemberProfileViewProps) {
  const paragraphs = teamMemberBiographyParagraphs(member);
  const socialLinks = (member.social_links || []).filter((link) => link.href?.trim());
  const teamHref = pageSectionHref(page.slug);

  return (
    <div>
      <PageHero
        page={{
          hero_title: member.name,
          hero_subtitle: member.role,
        }}
        pageKey={member.slug || member.id}
        mainImage={member.photo}
        breadcrumbs={buildTeamMemberCrumbs(page.nav_label || page.hero_title, teamHref, member.name)}
      />

      <IndividualPageLayout site={site} currentPath={teamMemberProfileHref(page.slug, member)}>
      <section className="py-8 sm:py-10 md:py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-10">
          <aside className="mx-auto w-full max-w-sm space-y-6 lg:mx-0 lg:max-w-none">
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-md">
              <div className="relative aspect-[4/5] w-full bg-surface-muted">
                {member.photo ? (
                  <MediaImage src={member.photo} alt={member.name} fill className="object-cover object-top" />
                ) : null}
              </div>
              <div className="space-y-0 border-t border-border text-center">
                <div className="border-b border-border px-4 py-4">
                  <p className="text-sm font-bold uppercase tracking-wide text-primary">{member.name}</p>
                </div>
                <div className="border-b border-border px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0a7b83]">{member.role}</p>
                </div>
                <div className="px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{member.tagline}</p>
                </div>
              </div>
            </div>

            {(member.email || member.phone || member.whatsapp || socialLinks.length > 0) && (
              <div className="rounded-xl border border-border bg-surface p-5">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Contact</h2>
                <div className="space-y-3 text-sm">
                  {member.email?.trim() ? (
                    <p>
                      <span className="font-medium text-muted">Email:</span>{" "}
                      <a href={`mailto:${member.email.trim()}`} className="text-primary hover:underline">
                        {member.email.trim()}
                      </a>
                    </p>
                  ) : null}
                  {member.phone?.trim() ? (
                    <p>
                      <span className="font-medium text-muted">Phone:</span>{" "}
                      <a href={`tel:${member.phone.trim()}`} className="text-primary hover:underline">
                        {member.phone.trim()}
                      </a>
                    </p>
                  ) : null}
                  {member.whatsapp?.trim() ? (
                    <p>
                      <span className="font-medium text-muted">WhatsApp:</span>{" "}
                      <a
                        href={whatsappHref(member.whatsapp.trim())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {member.whatsapp.trim()}
                      </a>
                    </p>
                  ) : null}
                </div>

                {socialLinks.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {socialLinks.map((link, index) => (
                      <a
                        key={`${link.platform}-${index}`}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label || link.platform}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white transition hover:border-primary/30 hover:shadow-sm"
                      >
                        <SocialNetworkIcon
                          network={link.platform}
                          gradientId={`profile-${link.platform}-${index}`}
                          className="h-4 w-4"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </aside>

          <div className="min-w-0">
            <Link href={teamHref} className="mb-5 inline-flex text-sm font-semibold text-primary hover:underline sm:mb-6">
              ← Back to {page.nav_label || "Our Team"}
            </Link>

            <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">Biography</h2>

            {paragraphs.length > 0 ? (
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-muted">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-muted">Biography details will appear here once added in the admin panel.</p>
            )}
          </div>
        </div>
      </section>
      </IndividualPageLayout>
    </div>
  );
}
