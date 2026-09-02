"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LOCALE_COOKIE, LOCALES, DEFAULT_LOCALE, resolveLocale, type LocaleCode } from "@/lib/i18n/locales";
import { translate, type MessageKey } from "@/lib/i18n/messages";

interface LocaleContextValue {
  locale: LocaleCode;
  locales: typeof LOCALES;
  setLocale: (locale: LocaleCode) => void;
  t: (key: MessageKey) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  locales: LOCALES,
  setLocale: () => {},
  t: (key) => translate(DEFAULT_LOCALE, key),
});

function readCookieLocale(): LocaleCode {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  return resolveLocale(match?.[1]);
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: LocaleCode;
}) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  useEffect(() => {
    const cookieLocale = readCookieLocale();
    setLocaleState((current) => (current === cookieLocale ? current : cookieLocale));
  }, []);

  const setLocale = useCallback((next: LocaleCode) => {
    if (next === readCookieLocale()) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      locales: LOCALES,
      setLocale,
      t: (key) => translate(locale, key),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
