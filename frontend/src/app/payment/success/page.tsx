"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyPayment } from "@/lib/api";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [packageTitle, setPackageTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    verifyPayment(sessionId)
      .then((data) => {
        const booking = data.booking as { package?: { title?: string } };
        setPackageTitle(booking?.package?.title ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">✓</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      {loading ? (
        <p className="text-muted">Confirming your booking...</p>
      ) : packageTitle ? (
        <p className="text-gray-600 mb-8">
          Your booking for <strong>{packageTitle}</strong> has been confirmed. We&apos;ll contact you shortly with trip details.
        </p>
      ) : (
        <p className="text-gray-600 mb-8">
          Thank you for your payment. Our team will contact you shortly to confirm your trip details.
        </p>
      )}
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
