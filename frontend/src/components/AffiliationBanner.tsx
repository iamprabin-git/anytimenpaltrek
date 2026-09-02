"use client";

import MediaImage from "@/components/MediaImage";
import { useEffect, useMemo, useState } from "react";
import type { AffiliationBadge } from "@/types/site-content";

interface AffiliationBannerProps {
  badges: AffiliationBadge[];
}

const VISIBLE_COUNT = 3;
const AUTO_SWIPE_MS = 4500;

function BadgeLogo({ badge }: { badge: AffiliationBadge }) {
  if (badge.image) {
    return (
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-white">
        <MediaImage src={badge.image} alt={badge.label} fill className="object-contain p-1" />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-bold uppercase text-primary">
      {(badge.label || "LOGO").slice(0, 4)}
    </div>
  );
}

function AffiliationItem({ badge }: { badge: AffiliationBadge }) {
  const content = (
    <>
      <BadgeLogo badge={badge} />
      <p className="text-sm leading-snug text-foreground/85 md:text-[15px]">
        {badge.description || badge.label}
      </p>
    </>
  );

  if (badge.href) {
    return (
      <a
        href={badge.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 transition-opacity hover:opacity-80"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-4">{content}</div>;
}

function chunkBadges(badges: AffiliationBadge[], size: number): AffiliationBadge[][] {
  const slides: AffiliationBadge[][] = [];

  for (let index = 0; index < badges.length; index += size) {
    slides.push(badges.slice(index, index + size));
  }

  return slides;
}

export default function AffiliationBanner({ badges }: AffiliationBannerProps) {
  const visibleBadges = badges.filter((badge) => badge.visible !== false);
  const slides = useMemo(() => chunkBadges(visibleBadges, VISIBLE_COUNT), [visibleBadges]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const useCarousel = slides.length > 1;

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  useEffect(() => {
    if (!useCarousel) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_SWIPE_MS);

    return () => clearInterval(timer);
  }, [slides.length, useCarousel]);

  if (visibleBadges.length === 0) {
    return null;
  }

  return (
    <section aria-label="Our affiliations">
      <div className="bg-white pb-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative z-20 -mb-20 rounded-2xl rounded-br-[4rem] border border-border/50 bg-white px-5 py-8 shadow-[0_12px_40px_rgba(15,89,77,0.12)] md:px-8 md:py-10">
            {useCarousel ? (
              <div>
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {slides.map((slide, slideIndex) => (
                      <div
                        key={slideIndex}
                        className="grid w-full shrink-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
                      >
                        {slide.map((badge) => (
                          <AffiliationItem key={badge.id || badge.label} badge={badge} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === currentSlide ? "w-8 bg-primary" : "w-2.5 bg-primary/25"
                      }`}
                      aria-label={`Show affiliation group ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {visibleBadges.map((badge) => (
                  <AffiliationItem key={badge.id || badge.label} badge={badge} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-[var(--footer-bg)] pt-24" aria-hidden="true" />
    </section>
  );
}
