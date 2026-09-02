"use client";

import MediaImage from "@/components/MediaImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { hasMediaSrc } from "@/lib/media";
import type { HeroSlide } from "@/types";

interface HeroSliderProps {
  slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {hasMediaSrc(s.image) ? (
            <MediaImage src={s.image} alt={s.title} fill className="object-cover" priority={i === 0} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 text-white">
          {slide.subtitle && (
            <p className="text-accent font-semibold uppercase tracking-wider mb-3 text-sm md:text-base">
              {slide.subtitle}
            </p>
          )}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold max-w-3xl leading-tight mb-8">
            {slide.title}
          </h1>
          {slide.cta_text && slide.cta_link && (
            <Link href={slide.cta_link} className="btn-primary">
              {slide.cta_text}
            </Link>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === current ? "bg-accent" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
