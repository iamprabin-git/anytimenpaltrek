import PackageCard from "@/components/PackageCard";
import RelatedSection from "@/components/RelatedSection";
import { packageCategoryLabel } from "@/lib/related-content";
import type { Package } from "@/types";

interface RelatedPackagesProps {
  current: Package;
  packages: Package[];
  listHref: string;
  listLabel: string;
}

export default function RelatedPackages({ current, packages, listHref, listLabel }: RelatedPackagesProps) {
  if (packages.length === 0) return null;

  return (
    <RelatedSection
      title={`Related ${listLabel}`}
      subtitle={`More trips you may also like in ${packageCategoryLabel(current.category).toLowerCase()}.`}
      viewAllHref={listHref}
      viewAllLabel={`View all ${listLabel.toLowerCase()} →`}
      className="mx-auto mt-12 max-w-7xl px-4"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {packages.map((item) => (
          <PackageCard key={item.id} pkg={item} showCategory={item.category !== current.category} />
        ))}
      </div>
    </RelatedSection>
  );
}
