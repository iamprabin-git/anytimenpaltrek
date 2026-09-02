import type { Theme } from "@/lib/theme";

export interface BrandColors {
  primary: string;
  primary_dark: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  surface: string;
  surface_muted: string;
  muted: string;
  border: string;
}

export interface BrandFonts {
  body: string;
  heading: string;
}

export interface FooterTheme {
  background: string;
  background_dark: string;
  text: string;
  link: string;
  link_hover: string;
  heading: string;
  card_background: string;
  input_background: string;
  subscribe_button: string;
  subscribe_button_hover: string;
  border: string;
  icon_background: string;
  badge_text: string;
  support_text: string;
  copyright_text: string;
}

export interface BrandTheme {
  colors: BrandColors;
  fonts: BrandFonts;
  footer: FooterTheme;
}

export const FONT_OPTIONS: Record<string, { label: string; family: string; googleUrl?: string }> = {
  geist: { label: "Geist (Default)", family: "var(--font-geist-sans), system-ui, sans-serif" },
  inter: {
    label: "Inter",
    family: '"Inter", system-ui, sans-serif',
    googleUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  roboto: {
    label: "Roboto",
    family: '"Roboto", system-ui, sans-serif',
    googleUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  },
  poppins: {
    label: "Poppins",
    family: '"Poppins", system-ui, sans-serif',
    googleUrl: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  },
  lora: {
    label: "Lora",
    family: '"Lora", Georgia, serif',
    googleUrl: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap",
  },
  montserrat: {
    label: "Montserrat",
    family: '"Montserrat", system-ui, sans-serif',
    googleUrl: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
  },
  open_sans: {
    label: "Open Sans",
    family: '"Open Sans", system-ui, sans-serif',
    googleUrl: "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap",
  },
  playfair: {
    label: "Playfair Display",
    family: '"Playfair Display", Georgia, serif',
    googleUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
  },
};

export const DEFAULT_BRAND_THEME: BrandTheme = {
  colors: {
    primary: "#2d6a4f",
    primary_dark: "#1b4332",
    secondary: "#40916c",
    accent: "#f4a261",
    background: "#ffffff",
    foreground: "#1a1a1a",
    surface: "#ffffff",
    surface_muted: "#f9fafb",
    muted: "#6b7280",
    border: "#e5e7eb",
  },
  fonts: {
    body: "geist",
    heading: "geist",
  },
  footer: {
    background: "#0f594d",
    background_dark: "#083f37",
    text: "#b8e6d3",
    link: "#b8e6d3",
    link_hover: "#ffffff",
    heading: "#ffffff",
    card_background: "#083f37",
    input_background: "#083f37",
    subscribe_button: "#22c55e",
    subscribe_button_hover: "#16a34a",
    border: "#0a4a40",
    icon_background: "#ffffff",
    badge_text: "#0f594d",
    support_text: "#9ee5c8",
    copyright_text: "#9ee5c8",
  },
};

export function mergeBrandTheme(stored?: Partial<BrandTheme> | null): BrandTheme {
  return {
    colors: { ...DEFAULT_BRAND_THEME.colors, ...(stored?.colors || {}) },
    fonts: { ...DEFAULT_BRAND_THEME.fonts, ...(stored?.fonts || {}) },
    footer: { ...DEFAULT_BRAND_THEME.footer, ...(stored?.footer || {}) },
  };
}

export function extractBrandTheme(dynamicSettings?: Record<string, unknown> | null): BrandTheme {
  const theme = dynamicSettings?.theme;
  if (!theme || typeof theme !== "object") {
    return DEFAULT_BRAND_THEME;
  }
  return mergeBrandTheme(theme as Partial<BrandTheme>);
}

const FONT_LINK_ATTR = "data-brand-font";

function loadGoogleFonts(urls: string[]) {
  if (typeof document === "undefined") return;

  document.querySelectorAll(`link[${FONT_LINK_ATTR}]`).forEach((node) => node.remove());

  urls.forEach((url, index) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.setAttribute(FONT_LINK_ATTR, String(index));
    document.head.appendChild(link);
  });
}

export function applyBrandTheme(theme: BrandTheme, colorScheme: Theme = "light") {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const { colors, fonts, footer } = theme;

  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-dark", colors.primary_dark);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--accent", colors.accent);

  const semanticVars = [
    "--background",
    "--foreground",
    "--surface",
    "--surface-muted",
    "--muted",
    "--border",
  ] as const;

  const footerVars = [
    "--footer-bg",
    "--footer-bg-dark",
    "--footer-text",
    "--footer-link",
    "--footer-link-hover",
    "--footer-heading",
    "--footer-card-bg",
    "--footer-input-bg",
    "--footer-subscribe",
    "--footer-subscribe-hover",
    "--footer-border",
    "--footer-icon-bg",
    "--footer-badge-text",
    "--footer-support-text",
    "--footer-copyright-text",
  ] as const;

  if (colorScheme === "light") {
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--surface", colors.surface);
    root.style.setProperty("--surface-muted", colors.surface_muted);
    root.style.setProperty("--muted", colors.muted);
    root.style.setProperty("--border", colors.border);

    root.style.setProperty("--footer-bg", footer.background);
    root.style.setProperty("--footer-bg-dark", footer.background_dark);
    root.style.setProperty("--footer-text", footer.text);
    root.style.setProperty("--footer-link", footer.link);
    root.style.setProperty("--footer-link-hover", footer.link_hover);
    root.style.setProperty("--footer-heading", footer.heading);
    root.style.setProperty("--footer-card-bg", footer.card_background);
    root.style.setProperty("--footer-input-bg", footer.input_background);
    root.style.setProperty("--footer-subscribe", footer.subscribe_button);
    root.style.setProperty("--footer-subscribe-hover", footer.subscribe_button_hover);
    root.style.setProperty("--footer-border", footer.border);
    root.style.setProperty("--footer-icon-bg", footer.icon_background);
    root.style.setProperty("--footer-badge-text", footer.badge_text);
    root.style.setProperty("--footer-support-text", footer.support_text);
    root.style.setProperty("--footer-copyright-text", footer.copyright_text);
  } else {
    semanticVars.forEach((name) => root.style.removeProperty(name));
    footerVars.forEach((name) => root.style.removeProperty(name));
  }

  const bodyFont = FONT_OPTIONS[fonts.body] || FONT_OPTIONS.geist;
  const headingFont = FONT_OPTIONS[fonts.heading] || FONT_OPTIONS.geist;
  const urls = [bodyFont.googleUrl, headingFont.googleUrl].filter(Boolean) as string[];

  if (urls.length > 0) {
    loadGoogleFonts(urls);
  } else {
    document.querySelectorAll(`link[${FONT_LINK_ATTR}]`).forEach((node) => node.remove());
  }

  root.style.setProperty("--font-body", bodyFont.family);
  root.style.setProperty("--font-heading", headingFont.family);
  root.style.setProperty("--font-sans", bodyFont.family);
}

export const COLOR_FIELDS: Array<{ key: keyof BrandColors; label: string }> = [
  { key: "primary", label: "Primary" },
  { key: "primary_dark", label: "Primary Dark" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Page Background" },
  { key: "foreground", label: "Text Color" },
  { key: "surface", label: "Surface / Cards" },
  { key: "surface_muted", label: "Muted Surface" },
  { key: "muted", label: "Muted Text" },
  { key: "border", label: "Border" },
];

export const FOOTER_COLOR_FIELDS: Array<{ key: keyof FooterTheme; label: string }> = [
  { key: "background", label: "Footer Background" },
  { key: "background_dark", label: "Footer Bottom Bar" },
  { key: "text", label: "Footer Text" },
  { key: "link", label: "Link Color" },
  { key: "link_hover", label: "Link Hover" },
  { key: "heading", label: "Heading Color" },
  { key: "card_background", label: "Contact Card Background" },
  { key: "input_background", label: "Newsletter Input Background" },
  { key: "subscribe_button", label: "Subscribe Button" },
  { key: "subscribe_button_hover", label: "Subscribe Button Hover" },
  { key: "border", label: "Footer Border" },
  { key: "icon_background", label: "Icon / Badge Background" },
  { key: "badge_text", label: "Badge Text" },
  { key: "support_text", label: "Support Text" },
  { key: "copyright_text", label: "Copyright Text" },
];
