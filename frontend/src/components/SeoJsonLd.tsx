import { getPublicSeoData } from "@/lib/seo-server";
import { absoluteUrl, getSiteUrl, resolveOgImage } from "@/lib/seo";
import { resolveMediaUrl } from "@/lib/media";

export default async function SeoJsonLd() {
  try {
    const { site, company, seo } = await getPublicSeoData();
    const siteUrl = getSiteUrl(seo);
    const logo = resolveMediaUrl(company.logo_url || company.logo);
    const sameAs = Object.entries(company.dynamic_settings || {})
      .filter(([key, value]) => key.startsWith("social_") && typeof value === "string" && value.trim())
      .map(([, value]) => String(value).trim());

    const organization = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: company.company_name || seo.site_name,
      url: siteUrl,
      logo: logo || undefined,
      description: company.description || seo.default_description,
      email: company.email || undefined,
      telephone: company.phone || undefined,
      address: company.address
        ? {
            "@type": "PostalAddress",
            streetAddress: company.address,
            addressCountry: "NP",
          }
        : undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    };

    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: seo.site_name,
      url: siteUrl,
      description: seo.default_description,
      publisher: {
        "@type": "Organization",
        name: company.company_name || seo.site_name,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/trekking?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };

    const homepage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seo.site_name,
      url: siteUrl,
      description: seo.default_description,
      isPartOf: {
        "@type": "WebSite",
        url: siteUrl,
        name: seo.site_name,
      },
      about: {
        "@type": "Thing",
        name: site.home?.about?.title || "Trekking and tours in Nepal",
      },
      primaryImageOfPage: resolveOgImage(seo.default_og_image)
        ? {
            "@type": "ImageObject",
            url: resolveOgImage(seo.default_og_image),
          }
        : undefined,
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepage) }} />
      </>
    );
  } catch {
    return null;
  }
}
