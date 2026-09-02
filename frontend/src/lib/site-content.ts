import type { CompanySettings } from "@/types";
import type { NavLink, NavMenu, PageSection, SiteContentMap, TeamMember } from "@/types/site-content";

export const DEFAULT_COMPANY_MENU: NavMenu = {
  label: "Company Info",
  visible: true,
  items: [
    { label: "About Us", href: "/about", visible: true },
    { label: "Our Team", href: "/pages/our-team", visible: true },
    { label: "Our Vision", href: "/pages/our-vision", visible: true },
    { label: "Our Mission", href: "/pages/our-mission", visible: true },
    { label: "Why Us", href: "/why-us", visible: true },
    { label: "Legal Documents", href: "/pages/legal-documents", visible: true },
  ],
};

export function visibleLinks<T extends { visible?: boolean }>(links: T[]): T[] {
  return links.filter((link) => link.visible !== false);
}

export function pageSectionHref(slug: string): string {
  return `/pages/${slug}`;
}

export function slugifyPageSection(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pageSectionNavLinks(
  sections: PageSection[] | undefined,
  placement: "header" | "footer" | "company_menu"
): NavLink[] {
  return (sections || [])
    .filter((section) => section.visible !== false)
    .filter((section) => {
      if (placement === "header") {
        return section.show_in_header;
      }
      if (placement === "footer") {
        return section.show_in_footer;
      }
      return section.show_in_company_menu;
    })
    .map((section) => ({
      label: section.nav_label,
      href: pageSectionHref(section.slug),
      visible: true,
    }));
}

export function companyMenuLinks(site: SiteContentMap | undefined): NavMenu | null {
  const menu = site?.header?.company_menu ?? DEFAULT_COMPANY_MENU;
  if (menu.visible === false) {
    return null;
  }

  const items = mergeNavLinks(
    visibleLinks(menu.items || []),
    pageSectionNavLinks(site?.page_sections?.items, "company_menu")
  );

  if (items.length === 0) {
    return null;
  }

  return {
    label: menu.label || DEFAULT_COMPANY_MENU.label,
    visible: true,
    items,
  };
}

export function companyInfoPageSlugs(site: SiteContentMap | undefined): Set<string> {
  const menu = companyMenuLinks(site) ?? DEFAULT_COMPANY_MENU;
  const slugs = new Set<string>();

  for (const item of menu.items) {
    if (item.href.startsWith("/pages/")) {
      slugs.add(item.href.slice("/pages/".length));
      continue;
    }

    const path = item.href.replace(/^\//, "").replace(/\/$/, "");
    if (path) {
      slugs.add(path);
    }
  }

  for (const section of site?.page_sections?.items || []) {
    if (section.show_in_company_menu) {
      slugs.add(section.slug);
    }
  }

  return slugs;
}

export function getCompanyInfoSections(site: SiteContentMap | undefined): PageSection[] {
  const slugs = companyInfoPageSlugs(site);
  const order = [...slugs];

  return (site?.page_sections?.items || [])
    .filter((section) => section.visible !== false && slugs.has(section.slug))
    .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

export interface SidebarNavItem {
  label: string;
  href: string;
  children?: SidebarNavItem[];
}

export interface SidebarNavGroup {
  heading: string;
  items: SidebarNavItem[];
}

export function resolvePageSectionHref(slug: string, menuItems: NavLink[] = []): string {
  const menuMatch = menuItems.find((item) => item.href === `/pages/${slug}` || item.href === `/${slug}`);
  if (menuMatch) {
    return menuMatch.href;
  }

  if (slug === "about") {
    return "/about";
  }

  if (slug === "why-us") {
    return "/why-us";
  }

  return pageSectionHref(slug);
}

export function pageSectionCurrentPath(slug: string): string {
  return resolvePageSectionHref(slug);
}

export const INDIVIDUAL_PAGES_SIDEBAR_EXCLUDED_SLUGS = new Set(["privacy-policy", "terms-and-conditions"]);

export function shouldShowIndividualPagesSidebar(slug: string): boolean {
  return !INDIVIDUAL_PAGES_SIDEBAR_EXCLUDED_SLUGS.has(slug);
}

function isSidebarPathActive(currentPath: string, href: string) {
  if (currentPath === href) {
    return true;
  }

  return href !== "/" && currentPath.startsWith(`${href}/`);
}

function teamSectionChildren(section: PageSection | undefined): SidebarNavItem[] {
  if (!section) {
    return [];
  }

  const isTeamPage =
    section.layout === "team" || (!section.layout && (section.team_members?.length ?? 0) > 0);

  if (!isTeamPage) {
    return [];
  }

  return (section.team_members || [])
    .filter((member) => member.visible !== false)
    .map((member) => ({
      label: member.name,
      href: teamMemberProfileHref(section.slug, member),
    }));
}

export function buildIndividualPagesSidebar(site: SiteContentMap | undefined): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [];
  const sections = (site?.page_sections?.items || []).filter((section) => section.visible !== false);
  const companyMenu = companyMenuLinks(site);
  const companySlugs = companyInfoPageSlugs(site);
  const menuItems = companyMenu?.items || [];

  if (companyMenu && menuItems.length > 0) {
    groups.push({
      heading: companyMenu.label || DEFAULT_COMPANY_MENU.label,
      items: menuItems.map((link) => {
        const slug = link.href.startsWith("/pages/")
          ? link.href.slice("/pages/".length).split("/")[0] || ""
          : link.href.replace(/^\//, "").split("/")[0] || "";
        const section = sections.find((item) => item.slug === slug);
        const children = teamSectionChildren(section);

        return children.length > 0 ? { label: link.label, href: link.href, children } : { label: link.label, href: link.href };
      }),
    });
  }

  const listedHrefs = new Set(
    groups.flatMap((group) =>
      group.items.flatMap((item) => [item.href, ...(item.children?.map((child) => child.href) || [])])
    )
  );

  const informationSections = sections.filter(
    (section) => !companySlugs.has(section.slug) && (section.show_in_footer || section.show_in_header)
  );

  if (informationSections.length > 0) {
    groups.push({
      heading: "Information",
      items: informationSections.map((section) => ({
        label: section.nav_label,
        href: resolvePageSectionHref(section.slug, menuItems),
      })),
    });

    for (const section of informationSections) {
      listedHrefs.add(resolvePageSectionHref(section.slug, menuItems));
    }
  }

  const remainingSections = sections.filter((section) => {
    const href = resolvePageSectionHref(section.slug, menuItems);
    return !companySlugs.has(section.slug) && !listedHrefs.has(href);
  });

  if (remainingSections.length > 0) {
    groups.push({
      heading: "More Pages",
      items: remainingSections.map((section) => ({
        label: section.nav_label,
        href: resolvePageSectionHref(section.slug, menuItems),
      })),
    });
  }

  return groups;
}

export function isSidebarLinkActive(currentPath: string, href: string) {
  return isSidebarPathActive(currentPath, href);
}

export function mergeCompanyInfoSections(
  allSections: PageSection[],
  companySections: PageSection[]
): PageSection[] {
  const next = [...allSections];

  for (const section of companySections) {
    const index = next.findIndex((item) => item.id === section.id);
    if (index >= 0) {
      next[index] = section;
    } else {
      next.push(section);
    }
  }

  return next;
}

const ACTIVITY_HREFS = new Set(["/tours", "/trekking", "/adventure"]);
const CONNECT_HREFS = new Set(["/blog", "/contact"]);

export interface HeaderNavLayout {
  activities: NavLink[];
  companyMenu: NavMenu | null;
  connect: NavLink[];
}

export function buildHeaderNavLayout(site: SiteContentMap | undefined): HeaderNavLayout {
  const companyMenu = companyMenuLinks(site);
  const companyHrefs = new Set(
    (companyMenu?.items || DEFAULT_COMPANY_MENU.items).map((item) => item.href)
  );

  const nav = mergeNavLinks(
    visibleLinks(site?.header?.nav || []),
    pageSectionNavLinks(site?.page_sections?.items, "header")
  ).filter((link) => !companyHrefs.has(link.href));

  const activities: NavLink[] = [];
  const connect: NavLink[] = [];
  const other: NavLink[] = [];

  for (const link of nav) {
    if (ACTIVITY_HREFS.has(link.href)) {
      activities.push(link);
      continue;
    }
    if (CONNECT_HREFS.has(link.href)) {
      connect.push(link);
      continue;
    }
    other.push(link);
  }

  const activityOrder = ["/tours", "/trekking", "/adventure"];
  activities.sort((a, b) => activityOrder.indexOf(a.href) - activityOrder.indexOf(b.href));

  const connectOrder = ["/blog", "/contact"];
  const groupedConnect = [...connect, ...other];
  groupedConnect.sort((a, b) => {
    const aIndex = connectOrder.indexOf(a.href);
    const bIndex = connectOrder.indexOf(b.href);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return {
    activities,
    companyMenu,
    connect: groupedConnect,
  };
}

export function mergeNavLinks(base: NavLink[], extra: NavLink[]): NavLink[] {
  const seen = new Set(base.map((link) => link.href));
  return [...base, ...extra.filter((link) => !seen.has(link.href))];
}

export function getPageSectionBySlug(
  site: SiteContentMap | undefined,
  slug: string
): PageSection | undefined {
  return site?.page_sections?.items?.find((section) => section.slug === slug && section.visible !== false);
}

export function teamMemberSlug(member: Pick<TeamMember, "id" | "slug">): string {
  return member.slug || member.id;
}

export function getTeamMemberBySlug(page: PageSection | undefined, memberSlug: string): TeamMember | undefined {
  return page?.team_members?.find(
    (member) => member.visible !== false && teamMemberSlug(member) === memberSlug
  );
}

export function teamMemberProfileHref(teamPageSlug: string, member: Pick<TeamMember, "id" | "slug">): string {
  return `/pages/${teamPageSlug}/${teamMemberSlug(member)}`;
}

export function teamMemberBiographyParagraphs(member: TeamMember): string[] {
  return (member.biography || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatCopyright(
  template: string,
  company: Pick<CompanySettings, "company_name" | "dynamic_settings">
): string {
  const settings = company.dynamic_settings || {};

  return template
    .replaceAll("{company_name}", company.company_name || "Anytime Nepal Trek")
    .replaceAll("{year}", String(new Date().getFullYear()))
    .replaceAll("{registration_number}", String(settings.registration_number || "132626"))
    .replaceAll("{tourism_license}", String(settings.tourism_license || "2083"));
}

export function pageContent(
  site: SiteContentMap | undefined,
  slug: keyof SiteContentMap["pages"]
) {
  return site?.pages?.[slug];
}

export function formatPageTitle(site: SiteContentMap | undefined, title: string): string {
  const template = site?.seo?.title_template || "%s | Anytime Nepal Trek";
  return template.replace("%s", title);
}
