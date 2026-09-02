import Link from "next/link";
import type { Package } from "@/types";

function packageHref(pkg: Pick<Package, "category" | "slug">) {
  const base = pkg.category === "trekking" ? "trekking" : pkg.category === "tour" ? "tours" : "adventure";
  return `/${base}/${pkg.slug}`;
}

interface ActivitiesSidebarProps {
  packages: Package[];
  currentSlug: string;
}

export default function ActivitiesSidebar({ packages, currentSlug }: ActivitiesSidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:w-72 xl:w-80">
      <div className="overflow-hidden rounded-lg border border-[#1a365d] bg-[#23406e] shadow-md">
        <div className="bg-[#1a365d] px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white">
          Activities
        </div>
        <nav className="max-h-[640px] overflow-y-auto">
          {packages.map((item) => {
            const active = item.slug === currentSlug;
            return (
              <Link
                key={item.id}
                href={packageHref(item)}
                className={`block border-b border-white/10 px-4 py-3 text-sm leading-snug transition-colors ${
                  active ? "bg-[#2f528b] font-semibold text-white" : "text-white/90 hover:bg-[#2a4678]"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export { packageHref };
