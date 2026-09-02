import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import { hasMediaSrc } from "@/lib/media";
import type { Package } from "@/types";
import type { SiteHomeContent } from "@/types/site-content";

interface SeasonTripProps {
  pkg: Package | null;
  copy: SiteHomeContent["season"];
}

export default function SeasonTrip({ pkg, copy }: SeasonTripProps) {
  if (!pkg) return null;

  const categoryPath =
    pkg.category === "trekking" ? "trekking" : pkg.category === "tour" ? "tours" : "adventure";

  return (
    <section className="py-16 bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{copy.title}</h2>
          {copy.subtitle ? <p className="text-white/80 text-lg">{copy.subtitle}</p> : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative h-80 lg:h-96 rounded-xl overflow-hidden">
            {hasMediaSrc(pkg.image) ? (
              <MediaImage src={pkg.image} alt={pkg.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
            )}
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6">{pkg.title}</h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              {pkg.max_altitude ? (
                <div>
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Max Altitude</p>
                  <p className="text-2xl font-bold text-accent">{pkg.max_altitude}m</p>
                </div>
              ) : null}
              {pkg.difficulty ? (
                <div>
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Difficulty</p>
                  <p className="text-2xl font-bold text-accent">{pkg.difficulty}</p>
                </div>
              ) : null}
              <div>
                <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Duration</p>
                <p className="text-2xl font-bold text-accent">{pkg.duration_days} Days</p>
              </div>
              <div>
                <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Rating</p>
                <p className="text-2xl font-bold text-accent">{pkg.rating}/5 ★</p>
              </div>
            </div>
            {copy.cta_text ? (
              <Link href={`/${categoryPath}/${pkg.slug}`} className="btn-outline">
                {copy.cta_text}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
