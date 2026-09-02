import SiteBreadcrumbs from "@/components/SiteBreadcrumbs";
import MediaImage from "@/components/MediaImage";
import BlogArticleContent from "@/components/blog/BlogArticleContent";
import BlogShareButton from "@/components/blog/BlogShareButton";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import { formatBlogPublishedDate } from "@/lib/date-utils";
import { parseBlogContent } from "@/lib/blog-content";
import { buildBlogPostCrumbs } from "@/lib/site-breadcrumbs";
import { hasMediaSrc, resolveMediaUrl } from "@/lib/media";
import type { BlogPost } from "@/types";

function formatBlogDate(value: string | null | undefined) {
  return formatBlogPublishedDate(value);
}

interface BlogPostDetailViewProps {
  post: BlogPost;
  latestPosts: BlogPost[];
  companyName: string;
  companyLogo?: string | null;
  canonicalPath: string;
}

export default function BlogPostDetailView({
  post,
  latestPosts,
  companyName,
  companyLogo,
  canonicalPath,
}: BlogPostDetailViewProps) {
  const { blocks, toc } = parseBlogContent(post.content);
  const publishedLabel = formatBlogDate(post.published_at);
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${canonicalPath}`;
  const logoUrl = resolveMediaUrl(companyLogo);

  return (
    <article className="blog-detail-page">
      <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80 lg:h-[22rem]">
        {hasMediaSrc(post.image) ? (
          <MediaImage src={post.image} alt={post.title} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,var(--primary-dark),var(--primary))]" />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <SiteBreadcrumbs items={buildBlogPostCrumbs(post)} />

        <header className="mt-6 border-b border-border pb-8">
          <h1 className="blog-detail-title">{post.title}</h1>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border bg-surface-muted">
                {logoUrl ? (
                  <MediaImage src={logoUrl} alt={companyName} fill className="object-contain p-1.5" sizes="48px" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                    {companyName
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() || "")
                      .join("")}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">{companyName}</p>
                {publishedLabel ? (
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Updated on {publishedLabel}
                  </p>
                ) : null}
              </div>
            </div>

            <BlogShareButton title={post.title} url={shareUrl} />
          </div>
        </header>

        {post.excerpt ? <p className="blog-detail-excerpt">{post.excerpt}</p> : null}

        {toc.length > 0 ? (
          <div className="mb-8 lg:hidden">
            <BlogTableOfContents items={toc} className="block" />
          </div>
        ) : null}

        <div className="blog-detail-grid">
          <div className="min-w-0">
            <BlogArticleContent blocks={blocks} />
          </div>
          <BlogTableOfContents items={toc} />
        </div>
      </div>

      <section className="bg-surface-muted/60 py-14">
        <RelatedBlogPosts
          posts={latestPosts}
          title="Latest Blog Posts"
          subtitle="Explore more travel stories, tips, and adventure guides from our team."
          viewAllLabel="View all blog posts →"
        />
      </section>
    </article>
  );
}
