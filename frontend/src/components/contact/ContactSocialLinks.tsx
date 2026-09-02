"use client";

import { useEffect, useId, useMemo, useState } from "react";
import SocialNetworkIcon from "@/components/SocialNetworkIcon";
import { useCarouselVisibleCount } from "@/hooks/useCarouselVisibleCount";
import { toFooterSocialLinks } from "@/lib/social-links";

interface ContactSocialLinksProps {
  dynamic: Record<string, unknown> | null | undefined;
  title: string;
  subtitle?: string;
}

const AUTO_SWIPE_MS = 4500;

type SocialLink = ReturnType<typeof toFooterSocialLinks>[number];

function chunkLinks(items: SocialLink[], size: number): SocialLink[][] {
  const slides: SocialLink[][] = [];

  for (let index = 0; index < items.length; index += size) {
    slides.push(items.slice(index, index + size));
  }

  return slides;
}

function SocialLinkCard({
  social,
  gradientId,
}: {
  social: SocialLink;
  gradientId: string;
}) {
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:gap-3 sm:px-5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted transition group-hover:bg-primary/10 sm:h-12 sm:w-12">
        <SocialNetworkIcon
          network={social.key}
          gradientId={`contact-${gradientId}-${social.key}`}
          className="h-5 w-5 sm:h-6 sm:w-6"
        />
      </span>
      <span className="text-center text-xs font-semibold text-foreground sm:text-sm">{social.label}</span>
    </a>
  );
}

function CarouselArrow({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border border-border bg-surface p-2 text-primary shadow-md transition hover:bg-surface-muted sm:p-2.5 ${
        direction === "prev" ? "left-1 sm:-translate-x-3" : "right-1 sm:translate-x-3"
      }`}
      aria-label={label}
    >
      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {direction === "prev" ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

export default function ContactSocialLinks({ dynamic, title, subtitle }: ContactSocialLinksProps) {
  const gradientId = useId().replace(/:/g, "");
  const links = toFooterSocialLinks(dynamic);
  const visibleCount = useCarouselVisibleCount({ sm: 2, md: 3, lg: 4 });
  const slides = useMemo(() => chunkLinks(links, visibleCount), [links, visibleCount]);
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

  function goToSlide(index: number) {
    setCurrentSlide((index + slides.length) % slides.length);
  }

  if (links.length === 0) {
    return null;
  }

  const gridClassName =
    visibleCount >= 4
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      : visibleCount === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2";

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="section-subtitle px-2">{subtitle}</p> : null}
        </div>

        <div className="relative mx-auto max-w-5xl px-8 sm:px-10 md:px-0">
          {useCarousel ? (
            <>
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {slides.map((slide, slideIndex) => (
                    <div key={slideIndex} className={`grid w-full shrink-0 gap-3 sm:gap-4 lg:gap-6 ${gridClassName}`}>
                      {slide.map((social) => (
                        <SocialLinkCard key={social.key} social={social} gradientId={gradientId} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <CarouselArrow direction="prev" onClick={() => goToSlide(currentSlide - 1)} label="Previous social links" />
              <CarouselArrow direction="next" onClick={() => goToSlide(currentSlide + 1)} label="Next social links" />

              <div className="mt-6 flex justify-center gap-2 md:mt-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === currentSlide ? "w-8 bg-primary" : "w-2.5 bg-primary/25"
                    }`}
                    aria-label={`Show social link group ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${gridClassName}`}>
              {links.map((social) => (
                <SocialLinkCard key={social.key} social={social} gradientId={gradientId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
