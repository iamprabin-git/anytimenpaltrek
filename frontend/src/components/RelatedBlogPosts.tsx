import MediaImage from "@/components/MediaImage";
import RelatedSection from "@/components/RelatedSection";
import Link from "next/link";
import { hasMediaSrc } from "@/lib/media";
import type { BlogPost } from "@/types";

function formatBlogDate(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RelatedBlogPosts({
  posts,
  title = "More Related Blogs",
  subtitle = "Continue reading more stories and travel tips from our blog.",
  viewAllLabel = "View all blog posts →",
}: {
  posts: BlogPost[];
  title?: string;
  subtitle?: string;
  viewAllLabel?: string;
}) {
  if (posts.length === 0) return null;

  return (
    <RelatedSection
      title={title}
      subtitle={subtitle}
      viewAllHref="/blog"
      viewAllLabel={viewAllLabel}
      className="mx-auto max-w-7xl px-4"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group block card-hover">
            <div className="relative mb-4 h-52 overflow-hidden rounded-xl">
              {hasMediaSrc(post.image) ? (
                <MediaImage
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
            </div>
            {post.published_at ? (
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                {formatBlogDate(post.published_at)}
              </p>
            ) : null}
            <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
              {post.title}
            </h3>
            {post.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p> : null}
          </Link>
        ))}
      </div>
    </RelatedSection>
  );
}
