import type { BlogPost, Package } from "@/types";
import type { PageSection } from "@/types/site-content";

export function packageCategoryLabel(category: Package["category"]) {
  switch (category) {
    case "trekking":
      return "Trekking";
    case "tour":
      return "Tours";
    default:
      return "Adventure";
  }
}

export function relatedPackages(current: Package, all: Package[], limit = 4): Package[] {
  const others = all.filter((item) => item.slug !== current.slug);
  if (others.length === 0) return [];

  const sameRegion = current.region
    ? others.filter((item) => item.region?.toLowerCase() === current.region?.toLowerCase())
    : [];

  const sameCategory = others.filter((item) => item.category === current.category);

  const picked: Package[] = [];
  const seen = new Set<number>();

  function add(items: Package[]) {
    for (const item of items) {
      if (picked.length >= limit) return;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      picked.push(item);
    }
  }

  add(sameRegion.filter((item) => item.category === current.category));
  add(sameCategory);
  add(others);

  return picked.slice(0, limit);
}

export function relatedBlogPosts(current: BlogPost, all: BlogPost[], limit = 4): BlogPost[] {
  return all
    .filter((post) => post.slug !== current.slug)
    .sort(
      (a, b) =>
        new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
    )
    .slice(0, limit);
}

const RELATED_PAGES_EXCLUDED_SLUGS = new Set(["privacy-policy", "terms-and-conditions"]);

export function relatedPageSections(currentSlug: string, all: PageSection[], limit = 4): PageSection[] {
  if (RELATED_PAGES_EXCLUDED_SLUGS.has(currentSlug)) return [];

  return all.filter((section) => section.visible !== false && section.slug !== currentSlug).slice(0, limit);
}
