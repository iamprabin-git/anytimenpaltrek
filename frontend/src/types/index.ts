export interface Package {
  id: number;
  title: string;
  slug: string;
  category: "trekking" | "tour" | "adventure";
  country?: string | null;
  region?: string | null;
  image: string | null;
  gallery_images?: string[] | null;
  short_description: string | null;
  description: string | null;
  itinerary?: string | null;
  availability_pricing?: string | null;
  duration_days: number;
  rating: number;
  price: string | number | null;
  price_label: string;
  difficulty: string | null;
  difficulty_score?: number | null;
  group_size_min?: number | null;
  group_size_max?: number | null;
  max_altitude: number | null;
  is_featured: boolean;
  is_season_pick: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface Destination {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  temperature_c: number | null;
  temperature_f: number | null;
  attractions: string[] | null;
  description: string | null;
  sort_order?: number;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface Review {
  id: number;
  author_name: string;
  author_country: string | null;
  author_avatar: string | null;
  gallery_images?: string[] | null;
  rating: number;
  content: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  gallery_images?: string[] | null;
  published_at: string | null;
  is_published?: boolean;
}

export interface CompanySettings {
  id: number;
  company_name: string;
  logo: string | null;
  logo_url?: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  dynamic_settings: Record<string, unknown> | null;
}

export interface SiteStats {
  reviews_count: number;
  happy_travellers: number;
  packages_count: number;
  destinations_count: number;
  years_experience: number;
}

export interface HomeData {
  company?: CompanySettings;
  hero_slides: HeroSlide[];
  featured_packages: Package[];
  best_selling: Package[];
  season_pick: Package | null;
  destinations: Destination[];
  reviews: Review[];
  blog_posts: BlogPost[];
  stats: SiteStats;
  site_content?: import("@/types/site-content").SiteContentMap;
}
