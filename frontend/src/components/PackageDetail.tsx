"use client";

import ActivitiesSidebar from "@/components/ActivitiesSidebar";
import SiteBreadcrumbs from "@/components/SiteBreadcrumbs";
import ContactForm from "@/components/ContactForm";
import DetailImageGallery from "@/components/DetailImageGallery";
import MediaImage from "@/components/MediaImage";
import PackageAvailabilityCalendar from "@/components/PackageAvailabilityCalendar";
import RelatedPackages from "@/components/RelatedPackages";
import Link from "next/link";
import { useMemo, useState } from "react";
import { isLoggedInAs } from "@/lib/auth";
import { buildPackageDetailCrumbs } from "@/lib/site-breadcrumbs";
import { relatedPackages } from "@/lib/related-content";
import type { Package, Review } from "@/types";

type TabId = "description" | "itinerary" | "pricing" | "info" | "gallery" | "review";

const TABS: Array<{ id: TabId; label: string; className: string }> = [
  { id: "description", label: "Description", className: "bg-[#23406e] text-white" },
  { id: "itinerary", label: "Itinerary", className: "bg-[#8ec5e8] text-[#1a365d]" },
  { id: "pricing", label: "Availability / Pricing", className: "bg-[#e8c4a0] text-[#1a365d]" },
  { id: "info", label: "Info Request", className: "bg-[#f0c8c8] text-[#1a365d]" },
  { id: "gallery", label: "Gallery", className: "bg-[#d4e898] text-[#1a365d]" },
  { id: "review", label: "Review", className: "bg-[#a8dce8] text-[#1a365d]" },
];

interface PackageDetailProps {
  pkg: Package;
  activityPackages: Package[];
  reviews: Review[];
  listHref: string;
  listLabel: string;
}

function splitParagraphs(text: string | null | undefined) {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function difficultyDisplay(pkg: Package) {
  const score = pkg.difficulty_score ?? pkg.rating;
  const label = pkg.difficulty || "Moderate";
  return `${score}/5 (${label})`;
}

function groupSizeDisplay(pkg: Package) {
  if (pkg.group_size_min && pkg.group_size_max) {
    return `${pkg.group_size_min} - ${pkg.group_size_max}`;
  }
  if (pkg.group_size_min) return `${pkg.group_size_min}+`;
  if (pkg.group_size_max) return `Up to ${pkg.group_size_max}`;
  return "1 - 6";
}

function StatsBar({ pkg }: { pkg: Package }) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-0 overflow-hidden rounded-lg border border-[#d9dee8] bg-[#eef1f6] sm:grid-cols-3">
      <div className="flex items-center gap-4 border-b border-[#d9dee8] px-6 py-5 sm:border-b-0 sm:border-r">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#23406e] shadow-sm">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#23406e]">Days</p>
          <p className="text-3xl font-bold text-[#23406e]">{pkg.duration_days}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 border-b border-[#d9dee8] px-6 py-5 sm:border-b-0 sm:border-r">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#23406e] shadow-sm">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 19h4V9H4v10zm6 0h4V5h-4v14zm6 0h4v-7h-4v7z" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#23406e]">Difficulty</p>
          <p className="text-lg font-bold text-red-600">{difficultyDisplay(pkg)}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 px-6 py-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#23406e] shadow-sm">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#23406e]">Group Size</p>
          <p className="text-3xl font-bold text-[#23406e]">{groupSizeDisplay(pkg)}</p>
        </div>
      </div>
    </div>
  );
}

function TextSection({ paragraphs }: { paragraphs: string[] }) {
  if (paragraphs.length === 0) {
    return <p className="text-muted">Details will be updated soon.</p>;
  }

  return (
    <div className="space-y-5 text-[15px] leading-7 text-[#333]">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function PackageDetail({ pkg, activityPackages, reviews, listHref, listLabel }: PackageDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const pageTitle = `${pkg.title}, ${pkg.duration_days} Days`;
  const galleryImages = pkg.gallery_images?.length ? pkg.gallery_images : pkg.image ? [pkg.image] : [];
  const related = useMemo(() => relatedPackages(pkg, activityPackages), [pkg, activityPackages]);
  const canWriteReview = isLoggedInAs("user");

  return (
    <section className="bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 lg:flex-row">
        <ActivitiesSidebar packages={activityPackages} currentSlug={pkg.slug} />

        <div className="min-w-0 flex-1">
          <SiteBreadcrumbs
            items={buildPackageDetailCrumbs(pkg, listHref, listLabel)}
            className="mb-6"
          />

          <h1 className="mb-8 text-center text-2xl font-bold text-[#23406e] md:text-3xl">{pageTitle}</h1>

          <div className="mb-8 flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-opacity md:px-5 ${
                    active ? tab.className : "bg-[#eef1f6] text-[#23406e] hover:opacity-90"
                  } ${active ? "ring-2 ring-[#23406e]/20" : ""}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "description" ? (
            <div>
              <StatsBar pkg={pkg} />
              {pkg.short_description ? (
                <p className="mb-5 text-lg leading-8 text-[#444]">{pkg.short_description}</p>
              ) : null}
              <TextSection paragraphs={splitParagraphs(pkg.description)} />
            </div>
          ) : null}

          {activeTab === "itinerary" ? (
            <div>
              <StatsBar pkg={pkg} />
              <TextSection paragraphs={splitParagraphs(pkg.itinerary || pkg.description)} />
            </div>
          ) : null}

          {activeTab === "pricing" ? (
            <div>
              <StatsBar pkg={pkg} />
              <div className="mb-6 rounded-lg border border-[#d9dee8] bg-[#eef1f6] p-6">
                <p className="text-sm font-bold uppercase tracking-wide text-[#23406e]">Trip Price</p>
                <p className="mt-2 text-3xl font-bold text-[#23406e]">
                  {pkg.price ? `${pkg.price_label} ${pkg.price}` : "Contact us for pricing"}
                </p>
                {pkg.max_altitude ? (
                  <p className="mt-2 text-sm text-muted">Max altitude: {pkg.max_altitude}m</p>
                ) : null}
              </div>
              <TextSection paragraphs={splitParagraphs(pkg.availability_pricing)} />
              <div className="mt-8">
                <PackageAvailabilityCalendar pkg={pkg} backHref={listHref} />
              </div>
            </div>
          ) : null}

          {activeTab === "info" ? (
            <div className="rounded-xl border border-[#d9dee8] bg-[#fafbfd] p-6 md:p-8">
              <h2 className="mb-2 text-xl font-bold text-[#23406e]">Request Information</h2>
              <p className="mb-6 text-sm text-muted">
                Send us your questions about <strong>{pkg.title}</strong> and our team will reply shortly.
              </p>
              <ContactForm
                defaultSubject={`Info request: ${pkg.title}`}
                defaultMessage={`Hello, I would like more information about ${pkg.title}.`}
              />
            </div>
          ) : null}

          {activeTab === "gallery" ? (
            <div>
              {galleryImages.length > 0 ? (
                <DetailImageGallery
                  mainImage={pkg.image}
                  galleryImages={galleryImages}
                  alt={pkg.title}
                  variant="inline"
                />
              ) : (
                <p className="text-muted">Gallery images will be added soon.</p>
              )}
            </div>
          ) : null}

          {activeTab === "review" ? (
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-[#23406e]">Customer Reviews</h2>
                {canWriteReview ? (
                  <Link href="/reviews/write" className="rounded-full bg-[#23406e] px-5 py-2 text-sm font-semibold text-white">
                    Write a Review
                  </Link>
                ) : (
                  <Link href="/login?redirect=/reviews/write" className="rounded-full bg-[#23406e] px-5 py-2 text-sm font-semibold text-white">
                    Log in to Review
                  </Link>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first to share your experience.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-[#d9dee8] bg-[#fafbfd] p-5">
                      <div className="mb-3 flex items-start gap-4">
                        {review.author_avatar ? (
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border">
                            <MediaImage src={review.author_avatar} alt={review.author_name} fill className="object-cover" />
                          </div>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-[#23406e]">
                              {review.author_name}
                              {review.author_country ? (
                                <span className="font-normal text-muted"> · {review.author_country}</span>
                              ) : null}
                            </p>
                            <p className="text-accent">{"★".repeat(review.rating)}</p>
                          </div>
                          <p className="text-sm leading-7 text-[#444]">{review.content}</p>
                        </div>
                      </div>
                      {review.gallery_images && review.gallery_images.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.gallery_images.map((image, index) => (
                            <div key={`${image}-${index}`} className="relative h-20 w-28 overflow-hidden rounded-lg border border-border">
                              <MediaImage src={image} alt={`Review photo ${index + 1}`} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <p className="mt-10 text-sm text-muted">
            <Link href={listHref} className="text-[#23406e] hover:underline">
              ← Back to {listLabel}
            </Link>
          </p>
        </div>
      </div>

      <RelatedPackages current={pkg} packages={related} listHref={listHref} listLabel={listLabel} />
    </section>
  );
}
