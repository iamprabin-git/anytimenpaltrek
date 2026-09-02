import type { MetadataRoute } from "next";
import { getBlogPosts, getPackages, getSiteContent } from "@/lib/api";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { absoluteUrl, packageCategoryPath } from "@/lib/seo";
import { teamMemberProfileHref } from "@/lib/site-content";

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/about", changeFrequency: "weekly", priority: 0.8 },
  { path: "/why-us", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/trekking", changeFrequency: "weekly", priority: 0.9 },
  { path: "/tours", changeFrequency: "weekly", priority: 0.9 },
  { path: "/adventure", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/reviews/write", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let seo: { site_url?: string } | undefined;

  try {
    const site = await getSiteContent(DEFAULT_LOCALE);
    seo = site.seo;
  } catch {
    seo = undefined;
  }

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path, seo),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const site = await getSiteContent(DEFAULT_LOCALE);
    seo = site.seo;

    for (const page of site.page_sections?.items || []) {
      if (page.visible === false) continue;
      entries.push({
        url: absoluteUrl(`/pages/${page.slug}`, seo),
        changeFrequency: "monthly",
        priority: 0.6,
      });

      if (page.layout === "team") {
        for (const member of page.team_members || []) {
          if (member.visible === false) continue;
          entries.push({
            url: absoluteUrl(teamMemberProfileHref(page.slug, member), seo),
            changeFrequency: "monthly",
            priority: 0.5,
          });
        }
      }
    }

    const packages = await getPackages(undefined, DEFAULT_LOCALE);
    for (const pkg of packages) {
      entries.push({
        url: absoluteUrl(`/${packageCategoryPath(pkg.category)}/${pkg.slug}`, seo),
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }

    const posts = await getBlogPosts(DEFAULT_LOCALE);
    for (const post of posts) {
      entries.push({
        url: absoluteUrl(`/blog/${post.slug}`, seo),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // keep static entries only
  }

  return entries;
}
