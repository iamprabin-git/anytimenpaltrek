"use client";

import { useLocale } from "@/lib/i18n/context";
import { type LocaleCode } from "@/lib/i18n/locales";

export default function LanguageSwitcher() {
  const { locale, locales, setLocale } = useLocale();

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleCode)}
        className="rounded-lg border border-border bg-surface px-2 py-1.5 text-foreground text-sm"
        aria-label="Select language"
      >
        {Object.entries(locales).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
