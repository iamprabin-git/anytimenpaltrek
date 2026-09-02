import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type LocaleCode } from "@/lib/i18n/locales";

export async function getServerLocale(): Promise<LocaleCode> {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}
