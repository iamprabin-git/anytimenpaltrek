"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import MediaImage from "@/components/MediaImage";
import SiteBreadcrumbs from "@/components/SiteBreadcrumbs";
import { BLOG_CATEGORIES, matchesBlogCategory } from "@/lib/blog-categories";
import { formatBlogDateBadge } from "@/lib/date-utils";
import { buildBlogListingCrumbs } from "@/lib/site-breadcrumbs";
import { hasMediaSrc } from "@/lib/media";
import type { BlogPost } from "@/types";

const CATEGORY_OPTIONS = [{ value: "all", label: "Choose Category" }, ...BLOG_CATEGORIES.map(({ value, label }) => ({ value, label }))];

function matchesCategory(post: BlogPost, category: string) {
  return matchesBlogCategory(post, category);
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 7.125 16.862 4.487" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="m21 21-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
      />
    </svg>
  );
}

export default function BlogListingView({
  posts,
  pageTitle = "Blog",
  sectionTitle = "Latest Travel Blogs",
  authorLabel = "Anytime Nepal Trek",
}: {
  posts: BlogPost[];
  pageTitle?: string;
  sectionTitle?: string;
  authorLabel?: string;
}) {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const initialCategory = searchParams.get("category");
    if (initialCategory && CATEGORY_OPTIONS.some((option) => option.value === initialCategory)) {
      setCategory(initialCategory);
    }
  }, [searchParams]);

  const authorName = authorLabel.split(/\s+/)[0] || authorLabel;

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (!matchesCategory(post, category)) return false;
      if (!normalizedQuery) return true;

      const haystack = `${post.title} ${post.excerpt || ""} ${post.slug}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [posts, category, query]);

  return (
    <div className="blog-listing-page">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <SiteBreadcrumbs items={buildBlogListingCrumbs()} />

        <h1 className="blog-listing-title">{pageTitle}</h1>

        <div className="blog-listing-toolbar">
          <label className="blog-listing-select-wrap">
            <span className="sr-only">Choose category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="blog-listing-select"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="blog-listing-search-wrap">
            <SearchIcon />
            <span className="sr-only">Search blog posts</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="blog-listing-search"
            />
          </label>
        </div>

        <h2 className="blog-listing-section-title">{sectionTitle}</h2>

        {filteredPosts.length === 0 ? (
          <p className="py-12 text-center text-muted">No blog posts match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => {
              const badge = formatBlogDateBadge(post.published_at);

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card group">
                  <div className="blog-card-image-wrap">
                    {hasMediaSrc(post.image) ? (
                      <MediaImage
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(135deg,var(--primary-dark),var(--primary))]" />
                    )}
                    {badge ? (
                      <div className="blog-card-date">
                        <span className="blog-card-date-day">{badge.day}</span>
                        <span className="blog-card-date-month">{badge.month}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="blog-card-meta">
                    <PenIcon />
                    <span>By {authorName}</span>
                  </div>

                  <h3 className="blog-card-title">{post.title}</h3>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
