import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import { hasMediaSrc } from "@/lib/media";
import type { BlogPost } from "@/types";
import type { SiteHomeContent } from "@/types/site-content";

interface BlogSectionProps {
  posts: BlogPost[];
  copy: SiteHomeContent["blog"];
}

export default function BlogSection({ posts, copy }: BlogSectionProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">{copy.title}</h2>
          {copy.subtitle ? <p className="section-subtitle">{copy.subtitle}</p> : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block card-hover">
              <div className="relative h-52 rounded-xl overflow-hidden mb-4">
                {hasMediaSrc(post.image) ? (
                  <MediaImage
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : null}
              </div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>

        {copy.cta_text && copy.cta_link ? (
          <div className="text-center mt-10">
            <Link href={copy.cta_link} className="btn-primary">
              {copy.cta_text}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
