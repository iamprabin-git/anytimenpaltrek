"use client";

import Link from "next/link";

import type { Package } from "@/types";

interface BookNowButtonProps {
  pkg: Package;
  backHref?: string;
  bookingDate?: string | null;
}

export default function BookNowButton({ pkg, backHref, bookingDate }: BookNowButtonProps) {
  const params = new URLSearchParams({ slug: pkg.slug });
  if (bookingDate) {
    params.set("date", bookingDate);
  }
  const checkoutHref = `/book/checkout?${params.toString()}`;
  const contactFallback = backHref || "/contact";

  if (!pkg.price) {
    return (
      <Link href={contactFallback} className="btn-primary w-full mt-6 text-center block">
        Book Now / Enquire
      </Link>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <Link href={checkoutHref} className="btn-primary w-full text-center block">
        Continue to Payment — {pkg.price_label} {pkg.price}
      </Link>
      <Link href={contactFallback} className="block text-center text-sm text-primary hover:underline">
        Or enquire without booking
      </Link>
    </div>
  );
}
