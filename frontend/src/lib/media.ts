export function hasMediaSrc(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function storageBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

/** Turn API media values (relative path, Cloudinary public_id, or absolute URL) into a browser-ready URL. */
export function resolveMediaUrl(value: string | null | undefined): string | null {
  if (!hasMediaSrc(value)) return null;

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("blob:")) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
    if (cloudName && value.includes("res.cloudinary.com/cloudinary/")) {
      return value.replace("res.cloudinary.com/cloudinary/", `res.cloudinary.com/${cloudName}/`);
    }

    return value;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (cloudName) {
    const normalizedPublicId = value.replace(/^\/+/, "").replace(/^storage\//, "");
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${normalizedPublicId}`;
  }

  const normalized = value.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${storageBaseUrl()}/storage/${normalized}`;
}

export function resolveAvatarUrl(profile: {
  avatar?: string | null;
  avatar_url?: string | null;
}): string | null {
  return resolveMediaUrl(profile.avatar_url || profile.avatar);
}

export function isGoogleAvatarUrl(value: string | null | undefined): boolean {
  return !!value && value.includes("googleusercontent.com");
}

export function isLocalStorageUrl(value: string): boolean {
  return value.includes("/storage/");
}

export function collectGalleryImages(mainImage?: string | null, galleryImages?: string[] | null): string[] {
  const items = [mainImage, ...(galleryImages || [])].filter((item): item is string => hasMediaSrc(item));
  return [...new Set(items)];
}

export const DEFAULT_PAGE_HERO_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80";

const PAGE_HERO_IMAGES: Record<string, string> = {
  about: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
  "why-us": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
  "our-team": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=80",
  "our-vision": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
  "our-mission": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80",
  "legal-documents": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80",
  "privacy-policy": "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80",
  "terms-and-conditions": "https://images.unsplash.com/photo-1526779255127-6a2568040ab9?w=1600&q=80",
  contact: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80",
  tours: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80",
  trekking: "https://images.unsplash.com/photo-1454496521428-8fad17877437?w=1600&q=80",
  adventure: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1600&q=80",
  blog: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80",
  reviews_write: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d4?w=1600&q=80",
};

export const PORTAL_LOGIN_IMAGES = {
  admin: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80",
  agent: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&q=80",
  customer: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
} as const;

const PAGE_HERO_POOL = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=80",
  "https://images.unsplash.com/photo-1526779255127-6a2568040ab9?w=1600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=1600&q=80",
  "https://images.unsplash.com/photo-1454496521428-8fad17877437?w=1600&q=80",
];

export function getPageHeroFallbackImage(pageKey = "default"): string {
  if (PAGE_HERO_IMAGES[pageKey]) {
    return PAGE_HERO_IMAGES[pageKey];
  }

  let hash = 0;
  for (let index = 0; index < pageKey.length; index += 1) {
    hash = (hash + pageKey.charCodeAt(index)) % PAGE_HERO_POOL.length;
  }

  return PAGE_HERO_POOL[hash] || DEFAULT_PAGE_HERO_IMAGE;
}
