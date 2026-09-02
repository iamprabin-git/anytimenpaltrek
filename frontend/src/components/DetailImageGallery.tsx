"use client";

import { useMemo, useState } from "react";
import MediaImage from "@/components/MediaImage";
import { collectGalleryImages, DEFAULT_PAGE_HERO_IMAGE, getPageHeroFallbackImage } from "@/lib/media";

interface DetailImageGalleryProps {
  mainImage?: string | null;
  galleryImages?: string[] | null;
  alt: string;
  variant?: "hero" | "inline";
  overlay?: React.ReactNode;
  fallbackImage?: string | null;
  pageKey?: string;
}

function HeroOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/40 to-black/10">
      {children}
    </div>
  );
}

export default function DetailImageGallery({
  mainImage,
  galleryImages,
  alt,
  variant = "hero",
  overlay,
  fallbackImage,
  pageKey,
}: DetailImageGalleryProps) {
  const images = useMemo(() => collectGalleryImages(mainImage, galleryImages), [mainImage, galleryImages]);
  const [activeIndex, setActiveIndex] = useState(0);
  const resolvedFallback = fallbackImage ?? (pageKey ? getPageHeroFallbackImage(pageKey) : DEFAULT_PAGE_HERO_IMAGE);

  const heroClass = variant === "hero" ? "relative h-48 md:h-[250px]" : "relative aspect-[16/10] w-full overflow-hidden rounded-xl";

  if (images.length === 0) {
    if (variant === "hero") {
      return (
        <section className={heroClass}>
          {resolvedFallback ? (
            <MediaImage src={resolvedFallback} alt={alt} fill className="object-cover" priority />
          ) : null}
          {overlay ? <HeroOverlay>{overlay}</HeroOverlay> : null}
        </section>
      );
    }

    return null;
  }

  const activeImage = images[activeIndex] || images[0];

  return (
    <section className={variant === "hero" ? "" : "space-y-4"}>
      <div className={heroClass}>
        <MediaImage src={activeImage} alt={alt} fill className="object-cover" priority />
        {overlay ? <HeroOverlay>{overlay}</HeroOverlay> : null}
      </div>

      {images.length > 1 ? (
        <div className={`flex gap-3 overflow-x-auto pt-4 ${variant === "hero" ? "max-w-7xl mx-auto px-4" : ""}`}>
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === activeIndex ? "border-primary" : "border-border hover:border-primary/60"
              }`}
              aria-label={`Show image ${index + 1}`}
            >
              <MediaImage src={image} alt={`${alt} thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
