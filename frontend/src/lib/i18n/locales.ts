export const DEFAULT_LOCALE = "en";

export const LOCALES = {
  en: "English",
  zh: "中文 (Chinese)",
  vi: "Tiếng Việt (Vietnamese)",
  fr: "Français (French)",
  es: "Español (Spanish)",
  de: "Deutsch (German)",
  ja: "日本語 (Japanese)",
  ko: "한국어 (Korean)",
  hi: "हिन्दी (Hindi)",
  th: "ไทย (Thai)",
  ru: "Русский (Russian)",
  ar: "العربية (Arabic)",
} as const;

export type LocaleCode = keyof typeof LOCALES;

export function isLocaleCode(value: string): value is LocaleCode {
  return value in LOCALES;
}

export function resolveLocale(value?: string | null): LocaleCode {
  if (value && isLocaleCode(value)) return value;
  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = "NEXT_LOCALE";
