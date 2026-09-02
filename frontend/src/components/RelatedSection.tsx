import Link from "next/link";
import type { ReactNode } from "react";

interface RelatedSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
}

export default function RelatedSection({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel,
  children,
  className = "",
}: RelatedSectionProps) {
  return (
    <div className={`border-t border-border pt-10 ${className}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {viewAllHref && viewAllLabel ? (
          <Link href={viewAllHref} className="text-sm font-semibold text-primary hover:underline">
            {viewAllLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}
