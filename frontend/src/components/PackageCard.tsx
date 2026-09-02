import MediaImage from "@/components/MediaImage";
import Link from "next/link";
import { hasMediaSrc } from "@/lib/media";
import type { Package } from "@/types";

interface PackageCardProps {
  pkg: Package;
  showCategory?: boolean;
}

export default function PackageCard({ pkg, showCategory = true }: PackageCardProps) {
  const categoryPath =
    pkg.category === "trekking"
      ? "trekking"
      : pkg.category === "tour"
        ? "tours"
        : "adventure";

  return (
    <Link
      href={`/${categoryPath}/${pkg.slug}`}
      className="group block bg-surface rounded-lg overflow-hidden shadow-md card-hover border border-border"
    >
      <div className="relative h-56 overflow-hidden">
        {hasMediaSrc(pkg.image) && (
          <MediaImage
            src={pkg.image}
            alt={pkg.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {showCategory && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded capitalize">
            {pkg.category}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
          {pkg.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pkg.duration_days} Days
          </span>
          <span className="flex items-center gap-1 text-accent">
            {[...Array(pkg.rating)].map((_, i) => (
              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </span>
        </div>
        {pkg.price && (
          <p className="mt-2 font-semibold text-primary">
            {pkg.price_label} {pkg.price}
          </p>
        )}
      </div>
    </Link>
  );
}
