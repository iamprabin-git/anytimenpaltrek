"use client";

import { useEffect, useMemo, useState } from "react";
import PackageCard from "@/components/PackageCard";
import type { Package } from "@/types";
import type { SiteHomeContent } from "@/types/site-content";

interface BestSellingProps {
  packages: Package[];
  copy: SiteHomeContent["best_selling"];
}

const VISIBLE_COUNT = 4;
const AUTO_SWIPE_MS = 5000;

function chunkPackages(items: Package[], size: number): Package[][] {
  const slides: Package[][] = [];

  for (let index = 0; index < items.length; index += size) {
    slides.push(items.slice(index, index + size));
  }

  return slides;
}

export default function BestSelling({ packages, copy }: BestSellingProps) {
  const slides = useMemo(() => chunkPackages(packages, VISIBLE_COUNT), [packages]);
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

  if (packages.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">{copy.title}</h2>
          {copy.subtitle ? <p className="section-subtitle">{copy.subtitle}</p> : null}
        </div>

        {useCarousel ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="grid w-full shrink-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                  >
                    {slide.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => goToSlide(currentSlide - 1)}
              className="absolute left-0 top-1/2 z-10 hidden -translate-x-3 -translate-y-1/2 rounded-full border border-border bg-surface p-2.5 text-primary shadow-md transition hover:bg-surface-muted md:inline-flex"
              aria-label="Previous best selling packages"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => goToSlide(currentSlide + 1)}
              className="absolute right-0 top-1/2 z-10 hidden translate-x-3 -translate-y-1/2 rounded-full border border-border bg-surface p-2.5 text-primary shadow-md transition hover:bg-surface-muted md:inline-flex"
              aria-label="Next best selling packages"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="mt-8 flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentSlide ? "w-8 bg-primary" : "w-2.5 bg-primary/25"
                  }`}
                  aria-label={`Show best selling group ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
