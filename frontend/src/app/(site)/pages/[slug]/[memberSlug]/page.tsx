import TeamMemberProfileView from "@/components/TeamMemberProfileView";
import { getLocalizedSiteContent } from "@/lib/i18n/server-page";
import { formatPageTitle, getPageSectionBySlug, getTeamMemberBySlug } from "@/lib/site-content";
import { createPageMetadata } from "@/lib/seo-server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; memberSlug: string }>;
}): Promise<Metadata> {
  const { slug, memberSlug } = await params;
  const { site } = await getLocalizedSiteContent();
  const page = getPageSectionBySlug(site, slug);
  const member = getTeamMemberBySlug(page, memberSlug);

  if (!page || page.layout !== "team" || !member) {
    return createPageMetadata({
      title: "Team Member Not Found",
      path: `/pages/${slug}/${memberSlug}`,
      noIndex: true,
    });
  }

  const title = formatPageTitle(site, member.name);

  return createPageMetadata({
    title,
    description: member.role,
    path: `/pages/${slug}/${memberSlug}`,
    image: member.photo,
  });
}

export default async function TeamMemberProfilePage({
  params,
}: {
  params: Promise<{ slug: string; memberSlug: string }>;
}) {
  const { slug, memberSlug } = await params;
  const { site } = await getLocalizedSiteContent();
  const page = getPageSectionBySlug(site, slug);
  const member = getTeamMemberBySlug(page, memberSlug);

  if (!page || page.layout !== "team" || !member) {
    notFound();
  }

  return <TeamMemberProfileView page={page} member={member} site={site} />;
}
