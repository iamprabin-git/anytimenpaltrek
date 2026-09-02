"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MediaImage from "@/components/MediaImage";
import PaymentDetailsPanel from "@/components/PaymentDetailsPanel";
import { getManualBookingInstructions, type ManualBookingResult } from "@/lib/api";

function formatBookingDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function statusMessage(status: string) {
  switch (status) {
    case "pending_approval":
    case "pending":
      return "Your booking request has been sent to a manager for approval.";
    case "confirmed":
      return "Your booking has been approved and confirmed.";
    case "rejected":
      return "Your booking request was not approved. Please contact us for help.";
    case "paid":
      return "Your online payment was completed successfully.";
    default:
      return "Your booking request has been received.";
  }
}

function ManualPaymentContent() {
  const searchParams = useSearchParams();
  const bookingId = Number(searchParams.get("booking_id") || "0");
  const email = searchParams.get("email") || "";
  const [data, setData] = useState<ManualBookingResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId || !email) {
      setError("Invalid booking link.");
      return;
    }

    getManualBookingInstructions(bookingId, email)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load booking details."));
  }, [bookingId, email]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Booking Not Found</h1>
        <p className="text-muted mb-8">{error}</p>
        <Link href="/contact" className="btn-primary">
          Contact Us
        </Link>
      </div>
    );
  }

  if (!data) {
    return <div className="py-24 text-center text-muted">Loading booking details...</div>;
  }

  const { booking, payment_settings: settings } = data;
  const methodLabel =
    booking.payment_method === "cod"
      ? "Cash on Delivery"
      : booking.payment_method === "manual"
        ? "Manual Payment"
        : "Online Payment";

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="text-4xl mb-4">{booking.status === "confirmed" || booking.status === "paid" ? "✓" : "⏳"}</div>
        <h1 className="text-3xl font-bold mb-2">
          {booking.status === "confirmed" ? "Booking Confirmed" : "Booking Request Submitted"}
        </h1>
        <p className="text-muted mb-6">{statusMessage(booking.status)}</p>
        <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted">Booking Reference</dt>
            <dd className="font-semibold">#{booking.id}</dd>
          </div>
          <div>
            <dt className="text-muted">Payment Method</dt>
            <dd className="font-semibold">{methodLabel}</dd>
          </div>
          <div>
            <dt className="text-muted">Package</dt>
            <dd className="font-semibold">{booking.package?.title}</dd>
          </div>
          <div>
            <dt className="text-muted">Amount</dt>
            <dd className="font-semibold">
              {booking.package?.price_label} {booking.amount}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Booking Date</dt>
            <dd className="font-semibold">{formatBookingDate(booking.booking_date)}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="font-semibold capitalize">{booking.status.replace(/_/g, " ")}</dd>
          </div>
        </dl>
      </div>

      {settings && booking.payment_method === "manual" ? <PaymentDetailsPanel settings={settings} compact /> : null}

      {booking.payment_proof_url ? (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Uploaded Payment Proof</h2>
          <div className="relative mx-auto h-64 w-full max-w-md overflow-hidden rounded-lg border border-border">
            <MediaImage src={booking.payment_proof_url} alt="Payment proof" fill className="object-contain" />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/account/bookings" className="btn-primary">
          View My Bookings
        </Link>
        <Link href="/" className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ManualPaymentPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">Loading...</div>}>
      <ManualPaymentContent />
    </Suspense>
  );
}
