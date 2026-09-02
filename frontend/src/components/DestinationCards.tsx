import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import { hasMediaSrc } from "@/lib/media";
import type { Destination } from "@/types";
import type { SiteHomeContent } from "@/types/site-content";

interface DestinationCardsProps {
  destinations: Destination[];
  copy: SiteHomeContent["destinations"];
}

export default function DestinationCards({ destinations, copy }: DestinationCardsProps) {
  return (
    <section className="py-16 bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">{copy.title}</h2>
          {copy.subtitle ? <p className="section-subtitle">{copy.subtitle}</p> : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <div key={dest.id} className="bg-surface rounded-xl overflow-hidden shadow-lg card-hover border border-border">
              <div className="relative h-56">
                {hasMediaSrc(dest.image) ? (
                  <MediaImage src={dest.image} alt={dest.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-dark/40" />
                )}
                {dest.temperature_c ? (
                  <span className="absolute top-4 right-4 bg-surface/90 text-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {dest.temperature_c}°C / {dest.temperature_f}°F
                  </span>
                ) : null}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-4">{dest.name}</h3>
                <h4 className="text-sm font-semibold text-primary uppercase mb-3">{copy.attractions_label}</h4>
                <ul className="space-y-2 mb-6">
                  {dest.attractions?.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                {copy.cta_text && copy.cta_link ? (
                  <Link href={copy.cta_link} className="text-primary font-semibold hover:text-primary-dark transition-colors">
                    {copy.cta_text}
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
