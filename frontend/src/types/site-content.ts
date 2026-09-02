export interface NavLink {
  label: string;
  href: string;
  visible?: boolean;
}

export interface NavMenu {
  label: string;
  visible?: boolean;
  items: NavLink[];
}

export interface SiteHeaderContent {
  nav: NavLink[];
  company_menu?: NavMenu;
  login_label: string;
  account_label: string;
}

export interface SiteFooterContent {
  about_title: string;
  about_text: string;
  quick_links_title: string;
  quick_links: NavLink[];
  activity_title: string;
  activity_links: NavLink[];
  affiliation_title?: string;
  affiliation_badges?: AffiliationBadge[];
  partner_title?: string;
  partner_badges?: FooterPartnerBadge[];
  social_title?: string;
  payment_title?: string;
  newsletter_placeholder?: string;
  subscribe_label?: string;
  designed_by?: string;
  designed_by_link?: string;
  contact_title: string;
  copyright: string;
}

export interface HomeSectionCopy {
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
}

export interface SiteHomeContent {
  featured: HomeSectionCopy;
  destinations: HomeSectionCopy & { attractions_label: string };
  best_selling: HomeSectionCopy;
  season: HomeSectionCopy;
  about: HomeSectionCopy & {
    paragraphs: string[];
    bullets: string[];
    stat_label: string;
    stat_note: string;
  };
  reviews: HomeSectionCopy & {
    reviews_label: string;
    travellers_label: string;
  };
  blog: HomeSectionCopy;
}

export interface SitePageContent {
  meta_title: string;
  meta_description: string;
  hero_title: string;
  hero_subtitle: string;
  heading?: string;
  paragraphs?: string[];
  list_title?: string;
  list_items?: string[];
  sidebar_title?: string;
  phone_label?: string;
  email_label?: string;
  location_label?: string;
  hours_label?: string;
  hours_text?: string;
  form_title?: string;
  map_title?: string;
  map_subtitle?: string;
  social_title?: string;
  social_subtitle?: string;
  sister_companies_title?: string;
  sister_companies_subtitle?: string;
  features?: Array<{ title: string; description: string }>;
}

export interface TeamMemberSocialLink {
  platform: string;
  label?: string;
  href: string;
}

export interface TeamMember {
  id: string;
  slug?: string;
  name: string;
  role: string;
  tagline: string;
  photo?: string;
  visible?: boolean;
  email?: string;
  phone?: string;
  whatsapp?: string;
  biography?: string;
  social_links?: TeamMemberSocialLink[];
}

export interface AffiliationBadge {
  id: string;
  label: string;
  description?: string;
  image?: string;
  href?: string;
  visible?: boolean;
}

export interface FooterPartnerBadge {
  id: string;
  label: string;
  href?: string;
  image?: string;
  visible?: boolean;
}

export interface LegalDocument {
  id: string;
  title: string;
  image?: string;
  visible?: boolean;
}

export interface SitePagesContent {
  about: SitePageContent;
  contact: SitePageContent;
  why_us: SitePageContent;
  trekking: SitePageContent;
  tours: SitePageContent;
  adventure: SitePageContent;
  blog: SitePageContent;
  reviews_write: SitePageContent;
}

export interface PageSection {
  id: string;
  slug: string;
  nav_label: string;
  visible?: boolean;
  show_in_header?: boolean;
  show_in_footer?: boolean;
  show_in_company_menu?: boolean;
  main_image?: string;
  gallery_images?: string[];
  meta_title: string;
  meta_description: string;
  hero_title: string;
  hero_subtitle: string;
  heading?: string;
  paragraphs?: string[];
  list_title?: string;
  list_items?: string[];
  features?: Array<{ title: string; description: string }>;
  team_members?: TeamMember[];
  legal_documents?: LegalDocument[];
  layout?: "content" | "features" | "team" | "about" | "legal" | "vision" | "mission";
}

export interface SitePageSectionsContent {
  items: PageSection[];
}

export interface SiteSeoContent {
  site_name: string;
  title_template: string;
  default_description: string;
  site_url?: string;
  default_og_image?: string;
  keywords?: string;
}

export interface SiteContentMap {
  header: SiteHeaderContent;
  footer: SiteFooterContent;
  home: SiteHomeContent;
  pages: SitePagesContent;
  page_sections: SitePageSectionsContent;
  seo: SiteSeoContent;
}
