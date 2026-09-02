"use client";

import { useEffect, useId, useState } from "react";
import {
  getAdminCompanySettings,
  updateAdminCompanySettings,
  type CompanySettings,
} from "@/lib/admin-api";
import {
  applyBrandTheme,
  COLOR_FIELDS,
  DEFAULT_BRAND_THEME,
  extractBrandTheme,
  FONT_OPTIONS,
  FOOTER_COLOR_FIELDS,
  type BrandTheme,
} from "@/lib/brand-theme";
import SocialNetworkIcon, { SOCIAL_PLATFORMS } from "@/components/SocialNetworkIcon";
import {
  createCompanySocialLink,
  nextAvailableSocialPlatform,
  parseCompanySocialLinks,
  serializeCompanySocialLinks,
  socialLinkLabel,
  stripCompanySocialKeys,
  type CompanySocialLink,
} from "@/lib/social-links";

type Tab = "colors" | "fonts" | "footer" | "social";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/40 p-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-lg border border-border bg-surface px-2 py-1.5 font-mono text-xs"
        />
      </div>
    </label>
  );
}

export default function AdminAppearancePage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [theme, setTheme] = useState<BrandTheme>(DEFAULT_BRAND_THEME);
  const [socialLinks, setSocialLinks] = useState<CompanySocialLink[]>([]);
  const [tab, setTab] = useState<Tab>("colors");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const socialGradientId = useId().replace(/:/g, "");

  useEffect(() => {
    getAdminCompanySettings()
      .then((data) => {
        setSettings(data);
        setTheme(extractBrandTheme((data.dynamic_settings || null) as Record<string, unknown> | null));
        setSocialLinks(parseCompanySocialLinks(data.dynamic_settings as Record<string, unknown> | null));
      })
      .catch(() => setError("Failed to load appearance settings."));
  }, []);

  useEffect(() => {
    applyBrandTheme(theme);
  }, [theme]);

  function updateColor(section: "colors" | "footer", key: string, value: string) {
    setTheme((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  }

  function updateSocialLink(index: number, next: CompanySocialLink) {
    setSocialLinks((prev) => prev.map((link, linkIndex) => (linkIndex === index ? next : link)));
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, linkIndex) => linkIndex !== index));
  }

  function addSocialLink() {
    const nextPlatform = nextAvailableSocialPlatform(socialLinks.map((link) => link.platform));
    if (!nextPlatform) return;
    setSocialLinks((prev) => [...prev, createCompanySocialLink(nextPlatform.value)]);
  }

  async function handleSave() {
    if (!settings) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const baseDynamic = stripCompanySocialKeys((settings.dynamic_settings || {}) as Record<string, unknown>);
      const result = await updateAdminCompanySettings({
        dynamic_settings: {
          ...baseDynamic,
          theme,
          ...serializeCompanySocialLinks(socialLinks),
        },
      });
      setSettings(result.settings);
      setTheme(extractBrandTheme((result.settings.dynamic_settings || null) as Record<string, unknown> | null));
      setSocialLinks(parseCompanySocialLinks(result.settings.dynamic_settings as Record<string, unknown> | null));
      setMessage("Appearance settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save appearance settings.");
    } finally {
      setSaving(false);
    }
  }

  function resetTheme() {
    setTheme(DEFAULT_BRAND_THEME);
  }

  if (!settings) {
    return <p className="text-muted">{error || "Loading appearance settings..."}</p>;
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "colors", label: "Site Colors" },
    { id: "fonts", label: "Typography" },
    { id: "footer", label: "Footer Colors" },
    { id: "social", label: "Social Links" },
  ];

  const canAddSocialLink = !!nextAvailableSocialPlatform(socialLinks.map((link) => link.platform));
  const nextSocialPlatform = nextAvailableSocialPlatform(socialLinks.map((link) => link.platform));
  const previewSocialLinks = socialLinks.filter((link) => link.href.trim());

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="panel-title mb-2">Appearance</h1>
          <p className="text-sm text-muted">
            Customize site colors, fonts, footer styling, and social links. Changes preview live on this page.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={resetTheme} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-muted">
            Reset Defaults
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Saving..." : "Save Appearance"}
          </button>
        </div>
      </div>

      {message ? <p className="mb-4 text-green-600">{message}</p> : null}
      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === item.id ? "bg-primary text-white" : "border border-border bg-surface"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel-card space-y-4">
          {tab === "colors" ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {COLOR_FIELDS.map((field) => (
                <ColorField
                  key={field.key}
                  label={field.label}
                  value={theme.colors[field.key]}
                  onChange={(value) => updateColor("colors", field.key, value)}
                />
              ))}
            </div>
          ) : null}

          {tab === "fonts" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Body Font</label>
                <select
                  value={theme.fonts.body}
                  onChange={(e) => setTheme((prev) => ({ ...prev, fonts: { ...prev.fonts, body: e.target.value } }))}
                  className="panel-input"
                >
                  {Object.entries(FONT_OPTIONS).map(([key, option]) => (
                    <option key={key} value={key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Heading Font</label>
                <select
                  value={theme.fonts.heading}
                  onChange={(e) => setTheme((prev) => ({ ...prev, fonts: { ...prev.fonts, heading: e.target.value } }))}
                  className="panel-input"
                >
                  {Object.entries(FONT_OPTIONS).map(([key, option]) => (
                    <option key={key} value={key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 rounded-xl border border-border bg-surface-muted/40 p-4">
                <p className="text-sm" style={{ fontFamily: FONT_OPTIONS[theme.fonts.body]?.family }}>
                  Body preview: Discover trekking, tours, and adventure holidays in Nepal.
                </p>
                <h3 className="mt-3 text-2xl font-bold" style={{ fontFamily: FONT_OPTIONS[theme.fonts.heading]?.family }}>
                  Heading preview: Anytime Nepal Trek
                </h3>
              </div>
            </div>
          ) : null}

          {tab === "footer" ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {FOOTER_COLOR_FIELDS.map((field) => (
                <ColorField
                  key={field.key}
                  label={field.label}
                  value={theme.footer[field.key]}
                  onChange={(value) => updateColor("footer", field.key, value)}
                />
              ))}
            </div>
          ) : null}

          {tab === "social" ? (
            <div className="space-y-4">
              {socialLinks.length === 0 ? (
                <p className="text-sm text-muted">No social media links yet. Use the button below to add one.</p>
              ) : null}
              {socialLinks.map((link, index) => (
                <div key={link.id} className="grid grid-cols-1 gap-2 md:grid-cols-[auto_180px_1fr_auto] md:items-center">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted"
                    title={socialLinkLabel(link.platform)}
                  >
                    <SocialNetworkIcon
                      network={link.platform}
                      gradientId={`appearance-${socialGradientId}-${link.id}`}
                      className="h-5 w-5"
                    />
                  </span>
                  <select
                    value={link.platform}
                    onChange={(e) =>
                      updateSocialLink(index, {
                        ...link,
                        platform: e.target.value,
                      })
                    }
                    className="panel-input"
                  >
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={link.href}
                    onChange={(e) => updateSocialLink(index, { ...link, href: e.target.value })}
                    placeholder="https://"
                    className="panel-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSocialLink}
                disabled={!canAddSocialLink}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {nextSocialPlatform ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-muted">
                    <SocialNetworkIcon
                      network={nextSocialPlatform.value}
                      gradientId={`appearance-add-${socialGradientId}`}
                      className="h-4 w-4"
                    />
                  </span>
                ) : null}
                Add social media
              </button>
            </div>
          ) : null}
        </div>

        <div className="panel-card">
          <h2 className="mb-4 text-lg font-semibold">Live Preview</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="p-4" style={{ background: theme.colors.primary_dark, color: "#fff" }}>
              <p className="text-sm">Header bar preview</p>
            </div>
            <div className="p-4" style={{ background: theme.colors.surface, color: theme.colors.foreground }}>
              <p className="text-sm text-[color:var(--muted)]">Navigation area</p>
              <button type="button" className="mt-3 rounded px-4 py-2 text-sm font-semibold text-white" style={{ background: theme.colors.primary }}>
                Primary Button
              </button>
            </div>
            <div className="p-4 footer-shell">
              <p className="footer-heading text-base">Footer Preview</p>
              <a href="#" className="footer-link text-sm">
                Sample footer link
              </a>
              <div className="mt-3 flex overflow-hidden rounded-full footer-input-shell">
                <div className="flex-1 px-4 py-2 text-sm text-white/80">Your Email address</div>
                <div className="footer-subscribe-btn px-4 py-2 text-sm font-semibold text-white">Subscribe</div>
              </div>
              {previewSocialLinks.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {previewSocialLinks.map((link) => (
                    <span
                      key={link.id}
                      className="footer-icon-bg flex h-10 w-10 items-center justify-center rounded-full shadow-sm"
                      title={socialLinkLabel(link.platform)}
                    >
                      <SocialNetworkIcon
                        network={link.platform}
                        gradientId={`appearance-preview-${socialGradientId}-${link.id}`}
                        className="h-5 w-5"
                      />
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
