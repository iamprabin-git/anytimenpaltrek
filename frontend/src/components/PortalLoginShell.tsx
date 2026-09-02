import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import { loadPortalBrand, type PortalBrand } from "@/lib/portal-brand";
import type { ReactNode } from "react";

interface PortalLoginShellProps {
  portalLabel: string;
  imageTagline: string;
  imageSubline?: string;
  image: string;
  imageAlt: string;
  children: ReactNode;
}

function DefaultLogoMark({ light = false }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill={light ? "#ffffff" : "#0a4a40"} fillOpacity={light ? "0.18" : "1"} />
      <path d="M12 46 L28 24 L38 34 L52 18" stroke={light ? "#ffffff" : "#7dd3b0"} strokeWidth="3" fill="none" />
      <circle cx="44" cy="20" r="4" fill="#fbbf24" />
    </svg>
  );
}

export function PortalBrandLink({ brand, light = false }: { brand: PortalBrand; light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 transition-opacity hover:opacity-80 ${light ? "text-white" : "text-foreground"}`}
    >
      <span
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ${
          light ? "bg-white/15 ring-1 ring-white/20" : "bg-primary/10 ring-1 ring-primary/10"
        }`}
      >
        {brand.logoUrl ? (
          <MediaImage src={brand.logoUrl} alt={brand.companyName} fill className="object-contain p-1.5" />
        ) : (
          <DefaultLogoMark light={light} />
        )}
      </span>
      <span>
        <span className={`block text-sm font-bold tracking-[0.08em] ${light ? "text-white" : "text-foreground"}`}>
          {brand.companyName}
        </span>
        {brand.tagline ? (
          <span className={`block text-[11px] uppercase tracking-[0.18em] ${light ? "text-white/65" : "text-muted"}`}>
            {brand.tagline}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function LifestyleImagePanel({
  portalLabel,
  imageTagline,
  imageSubline,
  image,
  imageAlt,
}: Omit<PortalLoginShellProps, "children">) {
  return (
    <div className="relative min-h-full overflow-hidden">
      <MediaImage src={image} alt={imageAlt} fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />

      <div className="relative flex h-full flex-col justify-end p-8 sm:p-10 lg:p-12">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">{portalLabel}</p>
          <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            {imageTagline}
          </h1>
          {imageSubline ? (
            <p className="mt-4 max-w-sm text-base text-white/78 sm:text-lg">{imageSubline}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default async function PortalLoginShell({
  portalLabel,
  imageTagline,
  imageSubline,
  image,
  imageAlt,
  children,
}: PortalLoginShellProps) {
  const brand = await loadPortalBrand();

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden min-h-screen lg:block">
        <LifestyleImagePanel
          portalLabel={portalLabel}
          imageTagline={imageTagline}
          imageSubline={imageSubline}
          image={image}
          imageAlt={imageAlt}
        />
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <PortalBrandLink brand={brand} />
          </div>
          {children}
          <div className="mt-8 border-t border-border/70 pt-6 text-center">
            <Link href="/" className="text-sm font-medium text-muted transition-colors hover:text-primary">
              ← Continue browsing the website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PortalAuthCardShellProps {
  children: ReactNode;
}

export async function PortalAuthCardShell({ children }: PortalAuthCardShellProps) {
  const brand = await loadPortalBrand();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8">
          <PortalBrandLink brand={brand} />
        </div>
        {children}
      </div>
    </div>
  );
}
