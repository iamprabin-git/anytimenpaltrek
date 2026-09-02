"use client";

import { useId, useState } from "react";
import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import FooterPartnerBadgeItem from "@/components/FooterPartnerBadge";
import ContactInfoItem from "@/components/ContactInfoItem";
import SocialNetworkIcon from "@/components/SocialNetworkIcon";
import { useSiteContent } from "@/components/SiteContentProvider";
import { whatsappUrl } from "@/lib/company-contact";
import { resolveMediaUrl } from "@/lib/media";
import { formatCopyright, mergeNavLinks, pageSectionNavLinks, visibleLinks } from "@/lib/site-content";
import { toFooterSocialLinks } from "@/lib/social-links";

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="footer-link">
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className="footer-link">
      {label}
    </Link>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="footer-icon-bg flex h-10 w-10 items-center justify-center rounded-full shadow-sm">
      {children}
    </span>
  );
}

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="footer-badge flex h-10 min-w-[58px] items-center justify-center rounded-md px-3 shadow-sm">
      {children}
    </span>
  );
}

function CompanyLogoMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#0a4a40" />
      <path d="M12 46 L28 24 L38 34 L52 18" stroke="#7dd3b0" strokeWidth="3" fill="none" />
      <circle cx="44" cy="20" r="4" fill="#fbbf24" />
      <path d="M18 48 H46" stroke="#7dd3b0" strokeWidth="2" />
    </svg>
  );
}

export default function Footer() {
  const { site, company } = useSiteContent();
  const socialGradientId = useId().replace(/:/g, "");
  const footer = site?.footer;
  const dynamic = company?.dynamic_settings || {};
  const companyName = company?.company_name || footer?.about_title || "Anytime Nepal Trek";
  const logoUrl = resolveMediaUrl(company?.logo_url || company?.logo);
  const aboutText =
    footer?.about_text ||
    company?.description ||
    "Discover the beauty of hidden nature, culture and adventure in Nepal, Tibet, and Bhutan.";
  const phone = company?.phone || "+977 9851086445";
  const whatsapp = String(dynamic.contact_whatsapp || phone);
  const whatsappHref = whatsappUrl(whatsapp);
  const email = company?.email;
  const address = company?.address;
  const website = company?.website;
  const supportText = String(dynamic.support_hours || "24/7 Support [Viber & WhatsApp]");
  const copyright = company
    ? formatCopyright(footer?.copyright || "© Copyright {company_name} {year}.", company)
    : footer?.copyright || `© Copyright Anytime Nepal Trek ${new Date().getFullYear()}.`;

  const brandParts = companyName.split(" ");
  const firstPart = brandParts[0] || "Anytime";
  const restPart = brandParts.slice(1).join(" ") || "Nepal Trek";

  const portalLinks = [
    { label: "Admin Login", href: "/admin/login", visible: true },
    { label: "Agent Login", href: "/agent/login", visible: true },
  ];
  const quickLinks = mergeNavLinks(
    visibleLinks(footer?.quick_links || []),
    pageSectionNavLinks(site?.page_sections?.items, "footer")
  );
  const existingHrefs = new Set(quickLinks.map((link) => link.href));
  const mergedQuickLinks = [
    ...quickLinks,
    ...portalLinks.filter((link) => !existingHrefs.has(link.href)),
  ];

  const partnerBadges = (footer?.partner_badges || [
    { id: "tripadvisor", label: "TripAdvisor", href: "https://www.tripadvisor.com", visible: true },
    { id: "booking-com", label: "Booking.com", href: "https://www.booking.com", visible: true },
    { id: "google", label: "Google", href: "https://www.google.com/travel", visible: true },
    { id: "viator", label: "Viator", href: "https://www.viator.com", visible: true },
    { id: "expedia", label: "Expedia", href: "https://www.expedia.com", visible: true },
    { id: "trustpilot", label: "Trustpilot", href: "https://www.trustpilot.com", visible: true },
  ]).filter((badge) => badge.visible !== false);

  const socialLinks = toFooterSocialLinks(dynamic as Record<string, unknown>);

  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    setEmailInput("");
  }

  return (
    <footer className="footer-shell">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          <div className="lg:col-span-4 xl:col-span-4">
            <Link href="/" className="group inline-flex max-w-md items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/95 p-2 shadow-lg">
                {logoUrl ? (
                  <MediaImage src={logoUrl} alt={companyName} fill className="object-contain" />
                ) : (
                  <CompanyLogoMark />
                )}
              </div>
              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-2xl font-bold text-white">{firstPart}</span>
                  <span className="text-2xl font-light text-white/75">{restPart}</span>
                </div>
                <p className="footer-support-text mt-2 text-sm leading-relaxed">{aboutText}</p>
              </div>
            </Link>

            <div className="mt-6 space-y-4">
              {address ? (
                <ContactInfoItem icon="location" variant="footer">
                  <p className="footer-support-text leading-relaxed">{address}</p>
                </ContactInfoItem>
              ) : null}
              {email ? (
                <ContactInfoItem icon="email" variant="footer">
                  <a href={`mailto:${email}`} className="footer-link hover:underline">
                    {email}
                  </a>
                </ContactInfoItem>
              ) : null}
              <ContactInfoItem icon="whatsapp" variant="footer">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-support-text leading-relaxed hover:underline"
                  >
                    {whatsapp}
                  </a>
                ) : (
                  <p className="footer-support-text leading-relaxed">{whatsapp}</p>
                )}
              </ContactInfoItem>
              {supportText ? (
                <ContactInfoItem icon="support" variant="footer">
                  <p className="footer-support-text text-xs">{supportText}</p>
                </ContactInfoItem>
              ) : null}
              {website ? (
                <ContactInfoItem icon="website" variant="footer">
                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link hover:underline"
                  >
                    {website.replace(/^https?:\/\//, "")}
                  </a>
                </ContactInfoItem>
              ) : null}
            </div>

            <div className="mt-6">
              <h4 className="footer-heading mb-3 text-sm">{footer?.social_title || "Social Media"}</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="transition-transform hover:scale-105"
                  >
                    <SocialIcon>
                      <SocialNetworkIcon
                        network={social.key}
                        gradientId={`footer-${socialGradientId}-${social.key}`}
                        className="h-5 w-5"
                      />
                    </SocialIcon>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-5 xl:col-span-4">
            <div>
              <h4 className="footer-heading">{footer?.quick_links_title || "Quick Links"}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {mergedQuickLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">{footer?.activity_title || "Adventure Activity"}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {visibleLinks(footer?.activity_links || []).map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 xl:col-span-4">
            <h4 className="footer-heading">{footer?.partner_title || "Find Us On"}</h4>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {partnerBadges.map((badge) => (
                <FooterPartnerBadgeItem key={badge.id || badge.label} badge={badge} />
              ))}
            </div>

            <div className="mt-8">
              <h4 className="footer-heading mb-3 text-sm">Newsletter</h4>
              <form onSubmit={handleSubscribe} className="footer-input-shell flex overflow-hidden rounded-full shadow-inner">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={footer?.newsletter_placeholder || "Your Email address"}
                  className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/50"
                />
                <button type="submit" className="footer-subscribe-btn shrink-0 px-5 py-3 text-sm font-semibold text-white transition-colors">
                  {footer?.subscribe_label || "Subscribe"}
                </button>
              </form>
              {subscribed ? <p className="footer-support-text mt-2 text-xs">Thank you for subscribing.</p> : null}
            </div>

            <div className="mt-8">
              <h4 className="footer-heading mb-3 text-sm">{footer?.payment_title || "Payment Method"}</h4>
              <div className="flex flex-wrap gap-3">
                <PaymentBadge>
                  <svg viewBox="0 0 48 30" className="h-5 w-10" aria-hidden="true">
                    <circle cx="18" cy="15" r="10" fill="#EB001B" opacity="0.9" />
                    <circle cx="30" cy="15" r="10" fill="#F79E1B" opacity="0.9" />
                  </svg>
                </PaymentBadge>
                <PaymentBadge>
                  <span className="text-sm font-bold italic text-[#1A1F71]">VISA</span>
                </PaymentBadge>
                <PaymentBadge>
                  <span className="text-[10px] font-bold leading-tight">
                    eBANK
                    <br />
                    TRANSFER
                  </span>
                </PaymentBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bar border-t">
        <div className="footer-copyright-text mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs md:flex-row">
          <p className="text-center md:text-left">{copyright}</p>
          <p className="flex items-center gap-2" style={{ color: "var(--footer-heading)" }}>
            {footer?.designed_by || "Designed by:"}
            {footer?.designed_by_link ? (
              <a href={footer.designed_by_link} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                &lt;/&gt;
              </a>
            ) : (
              <span className="font-semibold">&lt;/&gt;</span>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
