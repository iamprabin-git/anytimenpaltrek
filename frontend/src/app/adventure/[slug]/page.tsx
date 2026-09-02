import PackageDetail from "@/components/PackageDetail";
import { getPackage, getPackages, getReviews } from "@/lib/api";
import { getServerLocale } from "@/lib/i18n/server";
import { createPackageMetadata } from "@/lib/seo-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return createPackageMetadata(slug, "/adventure", "Adventure Not Found");
}

export default async function AdventureDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();

  try {
    const [pkg, activityPackages, reviews] = await Promise.all([
      getPackage(slug, locale),
      getPackages(undefined, locale),
      getReviews(locale),
    ]);

    if (pkg.category !== "adventure") notFound();

    return (
      <PackageDetail
        pkg={pkg}
        activityPackages={activityPackages}
        reviews={reviews}
        listHref="/adventure"
        listLabel="Adventure Holidays"
      />
    );
  } catch {
    notFound();
  }
}
