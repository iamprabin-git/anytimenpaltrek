import { detectBlogCategory } from "@/lib/blog-categories";
import type { BlogPost, Package } from "@/types";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function buildHomeCrumb(): BreadcrumbItem {
  return { label: "Home", href: "/" };
}

export function buildSectionCrumbs(label: string, href: string): BreadcrumbItem[] {
  return [buildHomeCrumb(), { label, href }];
}

export function buildPageCrumbs(label: string, href?: string): BreadcrumbItem[] {
  return href ? buildSectionCrumbs(label, href) : [buildHomeCrumb(), { label }];
}

export function buildBlogListingCrumbs(): BreadcrumbItem[] {
  return buildSectionCrumbs("Blog", "/blog");
}

export function buildBlogPostCrumbs(post: BlogPost): BreadcrumbItem[] {
  const category = detectBlogCategory(post);

  return [
    buildHomeCrumb(),
    { label: "Blog", href: "/blog" },
    { label: category.label, href: `/blog?category=${category.value}` },
    { label: post.title },
  ];
}

export function buildPackageDetailCrumbs(
  pkg: Pick<Package, "title" | "category"> & { region?: string | null },
  listHref: string,
  listLabel: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [buildHomeCrumb(), { label: listLabel, href: listHref }];

  if (pkg.region) {
    items.push({ label: pkg.region, href: listHref });
  }

  items.push({ label: pkg.title });
  return items;
}

export function buildTeamMemberCrumbs(pageLabel: string, teamHref: string, memberName: string): BreadcrumbItem[] {
  return [buildHomeCrumb(), { label: pageLabel, href: teamHref }, { label: memberName }];
}

export function packageListFromCategory(category: Package["category"]) {
  switch (category) {
    case "trekking":
      return { href: "/trekking", label: "Trekking" };
    case "tour":
      return { href: "/tours", label: "Tours" };
    default:
      return { href: "/adventure", label: "Adventure" };
  }
}

export function buildCheckoutCrumbs(pkg: Pick<Package, "title" | "category"> & { region?: string | null }): BreadcrumbItem[] {
  const list = packageListFromCategory(pkg.category);
  return buildPackageDetailCrumbs(pkg, list.href, list.label).concat([{ label: "Book Now" }]);
}

export function truncateBreadcrumbLabel(label: string, max = 56) {
  if (label.length <= max) return label;
  return `${label.slice(0, max).trim()}…`;
}
