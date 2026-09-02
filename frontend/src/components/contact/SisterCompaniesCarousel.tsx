"use client";

import MediaImage from "@/components/MediaImage";
import { useCarouselVisibleCount } from "@/hooks/useCarouselVisibleCount";
import { useEffect, useMemo, useState } from "react";
import type { SisterCompany } from "@/lib/contact-page";

interface SisterCompaniesCarouselProps {
  companies: SisterCompany[];
  title: string;
  subtitle?: string;
}

const AUTO_SWIPE_MS = 5000;

function chunkCompanies(items: SisterCompany[], size: number): SisterCompany[][] {
  const slides: SisterCompany[][] = [];

  for (let index = 0; index < items.length; index += size) {
    slides.push(items.slice(index, index + size));
  }

  return slides;
}

function normalizeWebsiteHref(website?: string) {
  const value = String(website || "").trim();
  if (!value) return null;
  return value.startsWith("http") ? value : `https://${value}`;
}

function SisterCompanyCard({ company }: { company: SisterCompany }) {
  const websiteHref = normalizeWebsiteHref(company.website);
  const initials = company.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const card = (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-6">
      <div className="mb-4 flex items-start gap-3 sm:gap-4">
        {company.logo ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:h-14 sm:w-14">
            <MediaImage src={company.logo} alt={company.name} fill className="object-contain p-1.5" />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary sm:h-14 sm:w-14">
            {initials || "SC"}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-base font-bold text-foreground sm:text-lg">{company.name}</h3>
          {company.location ? <p className="mt-1 text-sm text-muted">{company.location}</p> : null}
        </div>
      </div>

      {company.description ? (
        <p className="flex-1 text-sm leading-relaxed text-foreground/80">{company.description}</p>
      ) : null}

      {websiteHref ? <p className="mt-4 text-sm font-semibold text-primary sm:mt-5">Visit website →</p> : null}
    </article>
  );

  if (websiteHref) {
    return (
      <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="block h-full">
        {card}
      </a>
    );
  }

  return card;
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

export default function SisterCompaniesCarousel({ companies, title, subtitle }: SisterCompaniesCarouselProps) {
  const visibleCompanies = companies.filter((company) => company.visible !== false);
  const visibleCount = useCarouselVisibleCount({ sm: 1, md: 2, lg: 3 });
  const slides = useMemo(() => chunkCompanies(visibleCompanies, visibleCount), [visibleCompanies, visibleCount]);
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

  if (visibleCompanies.length === 0) {
    return null;
  }

  const gridClassName =
    visibleCount >= 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : visibleCount === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";

  return (
    <section className="bg-surface-muted/40 py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 text-center md:mb-12">
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="section-subtitle px-2">{subtitle}</p> : null}
        </div>

        {useCarousel ? (
          <div className="relative px-8 sm:px-10 md:px-0">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, slideIndex) => (
                  <div key={slideIndex} className={`grid w-full shrink-0 gap-4 sm:gap-6 ${gridClassName}`}>
                    {slide.map((company) => (
                      <SisterCompanyCard key={company.id} company={company} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <CarouselArrow
              direction="prev"
              onClick={() => goToSlide(currentSlide - 1)}
              label="Previous sister companies"
            />
            <CarouselArrow direction="next" onClick={() => goToSlide(currentSlide + 1)} label="Next sister companies" />

            <div className="mt-6 flex justify-center gap-2 md:mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentSlide ? "w-8 bg-primary" : "w-2.5 bg-primary/25"
                  }`}
                  aria-label={`Show sister company group ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${gridClassName}`}>
            {visibleCompanies.map((company) => (
              <SisterCompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
