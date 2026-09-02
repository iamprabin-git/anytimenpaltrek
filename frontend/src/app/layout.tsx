import type { Metadata } from "next";
import { Geist } from "next/font/google";
import SeoJsonLd from "@/components/SeoJsonLd";
import SiteChrome from "@/components/SiteChrome";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getSiteContent } from "@/lib/api";
import { getServerLocale } from "@/lib/i18n/server";
import { buildRootMetadata } from "@/lib/seo";
import "./globals.css";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const locale = await getServerLocale();
    const site = await getSiteContent(locale);
    return buildRootMetadata(site.seo);
  } catch {
    return buildRootMetadata({
      site_name: "Anytime Nepal Trek – Tours and Trekking in Nepal",
      title_template: "%s | Anytime Nepal Trek",
      default_description:
        "Discover trekking, tours, and adventure holidays in Nepal, Tibet, and Bhutan. Expert guides, unforgettable Himalayan experiences.",
      keywords: "Nepal trekking, Nepal tours, Himalayan adventures",
    });
  }
}

const themeScript = `(function(){try{var root=document.documentElement;var t=localStorage.getItem("theme");if(t==="light"){root.classList.remove("dark");return}if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){root.classList.add("dark")}else{root.classList.remove("dark")}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <SeoJsonLd />
        <ThemeProvider>
          <SiteChrome initialLocale={locale}>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
