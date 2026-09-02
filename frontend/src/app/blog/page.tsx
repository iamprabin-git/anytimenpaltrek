import { Suspense } from "react";
import BlogListingView from "@/components/blog/BlogListingView";
import { getBlogPosts, getCompanySettings } from "@/lib/api";
import { getLocalizedSiteContent } from "@/lib/i18n/server-page";
import { createPageMetadata } from "@/lib/seo-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getLocalizedSiteContent();
  const page = site.pages.blog;

  return createPageMetadata({
    title: page.meta_title,
    description: page.meta_description,
    path: "/blog",
  });
}

export default async function BlogPage() {
  const { locale, site } = await getLocalizedSiteContent();
  const [posts, company] = await Promise.all([getBlogPosts(locale), getCompanySettings(locale)]);

  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-muted">Loading blog...</div>}>
      <BlogListingView
        posts={posts}
        pageTitle={site.pages.blog.hero_title || "Blog"}
        sectionTitle="Latest Travel Blogs"
        authorLabel={company.company_name || "Anytime Nepal Trek"}
      />
    </Suspense>
  );
}
