import ContactForm from "@/components/ContactForm";
import ContactInfoItem from "@/components/ContactInfoItem";
import ContactPageExtras from "@/components/contact/ContactPageExtras";
import PageHero from "@/components/PageHero";
import { buildPageCrumbs } from "@/lib/site-breadcrumbs";
import { whatsappUrl } from "@/lib/company-contact";
import { getContactMapEmbedUrl, parseSisterCompanies } from "@/lib/contact-page";
import { getLocalizedCompanySettings, getLocalizedSiteContent } from "@/lib/i18n/server-page";
import { createPageMetadata } from "@/lib/seo-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getLocalizedSiteContent();
  const page = site.pages.contact;
  return createPageMetadata({
    title: page.meta_title,
    description: page.meta_description,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const { locale, site } = await getLocalizedSiteContent();
  const company = await getLocalizedCompanySettings(locale);
  const page = site.pages.contact;
  const whatsapp = String(company.dynamic_settings?.contact_whatsapp || company.phone || "");
  const whatsappHref = whatsappUrl(whatsapp);
  const mapEmbedUrl = getContactMapEmbedUrl(company);
  const sisterCompanies = parseSisterCompanies(company.dynamic_settings?.sister_companies);

  return (
    <div>
      <PageHero
        page={page}
        pageKey="contact"
        breadcrumbs={buildPageCrumbs(page.hero_title || "Contact", "/contact")}
      />

      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">{page.sidebar_title}</h2>
              <div className="space-y-5">
                {whatsapp ? (
                  <ContactInfoItem icon="whatsapp" label={page.phone_label}>
                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:underline"
                      >
                        {whatsapp}
                      </a>
                    ) : (
                      <span className="font-semibold">{whatsapp}</span>
                    )}
                  </ContactInfoItem>
                ) : null}
                {company.email ? (
                  <ContactInfoItem icon="email" label={page.email_label}>
                    <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                      {company.email}
                    </a>
                  </ContactInfoItem>
                ) : null}
                {company.address ? (
                  <ContactInfoItem icon="location" label={page.location_label}>
                    <p>{company.address}</p>
                  </ContactInfoItem>
                ) : null}
                {page.hours_text ? (
                  <ContactInfoItem icon="hours" label={page.hours_label}>
                    <p>{page.hours_text}</p>
                  </ContactInfoItem>
                ) : null}
                {company.website ? (
                  <ContactInfoItem icon="website" label="Website">
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </ContactInfoItem>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-5 sm:p-8">
              <h2 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">{page.form_title}</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <ContactPageExtras
        page={page}
        mapEmbedUrl={mapEmbedUrl}
        address={company.address || undefined}
        dynamic={company.dynamic_settings}
        sisterCompanies={sisterCompanies}
      />
    </div>
  );
}
