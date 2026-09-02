import Link from "next/link";
import MediaImage from "@/components/MediaImage";
import type { Review, SiteStats } from "@/types";
import type { SiteHomeContent } from "@/types/site-content";

interface ReviewsSectionProps {
  reviews: Review[];
  stats: Pick<SiteStats, "reviews_count" | "happy_travellers">;
  copy: SiteHomeContent["reviews"];
}

export default function ReviewsSection({ reviews, stats, copy }: ReviewsSectionProps) {
  return (
    <section className="py-16 bg-surface-muted">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title">{copy.title}</h2>
          <div className="flex justify-center gap-8 mt-6">
            <div>
              <span className="text-3xl font-bold text-primary">{stats.reviews_count}+</span>
              <p className="text-muted text-sm">{copy.reviews_label}</p>
            </div>
            <div>
              <span className="text-3xl font-bold text-primary">{stats.happy_travellers}+</span>
              <p className="text-muted text-sm">{copy.travellers_label}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.slice(0, 3).map((review) => (
            <blockquote
              key={review.id}
              className="bg-surface p-6 rounded-xl shadow-md border border-border border-l-4 border-l-accent"
            >
              <div className="mb-4 flex items-center gap-3">
                {review.author_avatar ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border">
                    <MediaImage src={review.author_avatar} alt={review.author_name} fill className="object-cover" />
                  </div>
                ) : null}
                <div>
                  <div className="flex items-center gap-1 text-accent">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <footer className="font-semibold text-foreground">
                    {review.author_name}
                    {review.author_country ? (
                      <span className="text-muted font-normal text-sm block">{review.author_country}</span>
                    ) : null}
                  </footer>
                </div>
              </div>
              <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-5">
                &ldquo;{review.content}&rdquo;
              </p>
              {review.gallery_images && review.gallery_images.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {review.gallery_images.slice(0, 3).map((image, index) => (
                    <div key={`${image}-${index}`} className="relative h-16 w-20 overflow-hidden rounded-lg border border-border">
                      <MediaImage src={image} alt={`Review photo ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </blockquote>
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
