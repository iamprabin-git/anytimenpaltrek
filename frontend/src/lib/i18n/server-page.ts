import { getCompanySettings, getSiteContent } from "@/lib/api";
import { getServerLocale } from "@/lib/i18n/server";
import type { LocaleCode } from "@/lib/i18n/locales";

export async function getLocalizedSiteContent() {
  const locale = await getServerLocale();
  const site = await getSiteContent(locale);
  return { locale, site };
}

export async function getLocalizedCompanySettings(locale?: LocaleCode) {
  const resolved = locale ?? (await getServerLocale());
  return getCompanySettings(resolved);
}
