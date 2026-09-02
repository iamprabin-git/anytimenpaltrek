"use client";

import ContactMap from "@/components/contact/ContactMap";
import ContactSocialLinks from "@/components/contact/ContactSocialLinks";
import SisterCompaniesCarousel from "@/components/contact/SisterCompaniesCarousel";
import type { SisterCompany } from "@/lib/contact-page";
import type { SitePageContent } from "@/types/site-content";

interface ContactPageExtrasProps {
  page: SitePageContent;
  mapEmbedUrl: string | null;
  address?: string;
  dynamic: Record<string, unknown> | null | undefined;
  sisterCompanies: SisterCompany[];
}

export default function ContactPageExtras({
  page,
  mapEmbedUrl,
  address,
  dynamic,
  sisterCompanies,
}: ContactPageExtrasProps) {
  return (
    <>
      {mapEmbedUrl ? (
        <ContactMap
          embedUrl={mapEmbedUrl}
          address={address}
          title={page.map_title || "Our Location"}
          subtitle={page.map_subtitle}
        />
      ) : null}

      <ContactSocialLinks
        dynamic={dynamic}
        title={page.social_title || "Follow Us"}
        subtitle={page.social_subtitle}
      />

      <SisterCompaniesCarousel
        companies={sisterCompanies}
        title={page.sister_companies_title || "Our Sister Companies"}
        subtitle={page.sister_companies_subtitle}
      />
    </>
  );
}
