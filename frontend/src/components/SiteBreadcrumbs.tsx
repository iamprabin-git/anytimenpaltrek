import Link from "next/link";
import { Fragment } from "react";
import { truncateBreadcrumbLabel, type BreadcrumbItem } from "@/lib/site-breadcrumbs";

export default function SiteBreadcrumbs({
  items,
  className = "",
  truncateLast = true,
}: {
  items: BreadcrumbItem[];
  className?: string;
  truncateLast?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`site-breadcrumbs ${className}`.trim()}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const label = isLast && truncateLast ? truncateBreadcrumbLabel(item.label) : item.label;

        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? <span aria-hidden="true">&gt;</span> : null}
            {item.href && !isLast ? (
              <Link href={item.href}>{label}</Link>
            ) : (
              <span className={isLast ? "text-foreground" : undefined}>{label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
