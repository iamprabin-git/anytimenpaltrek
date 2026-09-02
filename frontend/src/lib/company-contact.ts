import type { CompanySettings } from "@/types";
import { SOCIAL_PLATFORMS } from "@/components/SocialNetworkIcon";
import { parseCompanySocialLinks } from "@/lib/social-links";

export interface StaffContact {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  viber?: string;
}

export interface CompanyContactChannels {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  whatsapp: string;
  viber: string;
  supportHours: string;
  socialLinks: Array<{ key: string; label: string; href: string }>;
  staffContacts: StaffContact[];
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function whatsappUrl(number: string, message?: string) {
  const digits = digitsOnly(number);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function viberUrl(number: string) {
  const digits = digitsOnly(number);
  if (!digits) return null;
  return `viber://chat?number=${encodeURIComponent(`+${digits}`)}`;
}

export function telUrl(number: string) {
  const digits = digitsOnly(number);
  if (!digits) return null;
  return `tel:+${digits}`;
}

export function mailtoUrl(email: string, subject?: string) {
  if (!email) return null;
  return subject ? `mailto:${email}?subject=${encodeURIComponent(subject)}` : `mailto:${email}`;
}

function parseStaffContacts(raw: unknown, fallbackPhone: string, fallbackEmail: string): StaffContact[] {
  if (!Array.isArray(raw)) {
    return [
      {
        name: "Customer Support",
        role: "Reception",
        phone: fallbackPhone,
        email: fallbackEmail,
        whatsapp: fallbackPhone,
        viber: fallbackPhone,
      },
    ];
  }

  return raw
    .map((item): StaffContact | null => {
      if (!item || typeof item !== "object") return null;
      const contact = item as Record<string, unknown>;
      const name = String(contact.name || "").trim();
      if (!name) return null;

      return {
        name,
        role: String(contact.role || "").trim() || undefined,
        phone: String(contact.phone || "").trim() || undefined,
        email: String(contact.email || "").trim() || undefined,
        whatsapp: String(contact.whatsapp || "").trim() || undefined,
        viber: String(contact.viber || "").trim() || undefined,
      };
    })
    .filter((item): item is StaffContact => item !== null);
}

export function getCompanyContactChannels(company: CompanySettings | null): CompanyContactChannels {
  const dynamic = company?.dynamic_settings || {};
  const phone = company?.phone || "+977 9851086445";
  const email = company?.email || "info@anytimenepaltrek.com";

  const socialEntries = parseCompanySocialLinks(dynamic as Record<string, unknown>)
    .filter((link) => link.href.trim())
    .map((link) => ({
      key: link.platform,
      label: SOCIAL_PLATFORMS.find((item) => item.value === link.platform)?.label || link.platform,
      href: link.href.trim(),
    }));

  return {
    companyName: company?.company_name || "Anytime Nepal Trek",
    phone,
    email,
    address: company?.address || "Kathmandu, Nepal",
    website: company?.website || "",
    whatsapp: String(dynamic.contact_whatsapp || phone),
    viber: String(dynamic.contact_viber || phone),
    supportHours: String(dynamic.support_hours || "24/7 Support [Viber & WhatsApp]"),
    socialLinks: socialEntries,
    staffContacts: parseStaffContacts(dynamic.staff_contacts, phone, email),
  };
}
