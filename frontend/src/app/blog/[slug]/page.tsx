import BlogPostDetailView from "@/components/blog/BlogPostDetailView";
import { getBlogPost, getBlogPosts, getCompanySettings } from "@/lib/api";
import { getServerLocale } from "@/lib/i18n/server";
import { relatedBlogPosts } from "@/lib/related-content";
import { createPageMetadata } from "@/lib/seo-server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const locale = await getServerLocale();
    const post = await getBlogPost(slug, locale);
    return createPageMetadata({
      title: post.title,
      description: post.excerpt || undefined,
      path: `/blog/${post.slug}`,
      image: post.image,
      type: "article",
    });
  } catch {
    return createPageMetadata({ title: "Post Not Found", path: "/blog", noIndex: true });
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();

  try {
    const [post, allPosts, company] = await Promise.all([
      getBlogPost(slug, locale),
      getBlogPosts(locale),
      getCompanySettings(locale),
    ]);
    const latestPosts = relatedBlogPosts(post, allPosts);

    return (
      <BlogPostDetailView
        post={post}
        latestPosts={latestPosts}
        companyName={company.company_name || "Anytime Nepal Trek"}
        companyLogo={company.logo_url || company.logo}
        canonicalPath={`/blog/${post.slug}`}
      />
    );
  } catch {
    notFound();
  }
}
