import IndividualPagesSidebar from "@/components/IndividualPagesSidebar";
import { buildIndividualPagesSidebar } from "@/lib/site-content";
import type { SiteContentMap } from "@/types/site-content";
import type { ReactNode } from "react";

interface IndividualPageLayoutProps {
  site: SiteContentMap | undefined;
  currentPath: string;
  children: ReactNode;
}

export default function IndividualPageLayout({ site, currentPath, children }: IndividualPageLayoutProps) {
  const groups = buildIndividualPagesSidebar(site);

  if (groups.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-10 pt-2 sm:gap-8 sm:pb-16 lg:flex-row lg:items-start">
      <IndividualPagesSidebar groups={groups} currentPath={currentPath} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
