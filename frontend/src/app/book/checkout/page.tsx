"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PaymentDetailsPanel from "@/components/PaymentDetailsPanel";
import SiteBreadcrumbs from "@/components/SiteBreadcrumbs";
import { getAuthUser, isLoggedInAs } from "@/lib/auth";
import { getCheckoutOptions, submitBookingRequest, type CheckoutOptions } from "@/lib/api";
import { buildCheckoutCrumbs } from "@/lib/site-breadcrumbs";
import { imageAccept } from "@/lib/form-upload";

type PaymentMethod = "manual" | "cod" | "online";

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const preselectedDate = searchParams.get("date") || "";
  const user = getAuthUser();
  const [options, setOptions] = useState<CheckoutOptions | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("manual");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError("Package not found.");
      return;
    }

    getCheckoutOptions(slug)
      .then(setOptions)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load checkout."));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!options) return;

    if (method === "online") {
      setError("Online payment is coming soon. Please choose manual payment or cash on delivery.");
      return;
    }

    if (method === "manual" && !options.payment_settings) {
      setError("Manual payment details are not available right now.");
      return;
    }

    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("package_slug", slug);
    formData.set("payment_method", method);

    try {
      const result = await submitBookingRequest(formData);
      window.location.href = result.redirect_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit booking request.");
      setSubmitting(false);
    }
  }

  if (error && !options) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout Unavailable</h1>
        <p className="text-muted mb-8">{error}</p>
        <Link href="/contact" className="btn-primary">
          Contact Us
        </Link>
      </div>
    );
  }

  if (!options) {
    return <div className="py-24 text-center text-muted">Loading checkout...</div>;
  }

  const pkg = options.package;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <SiteBreadcrumbs items={buildCheckoutCrumbs(pkg)} />
      <div>
        <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
        <p className="text-muted">
          {pkg.title} · {pkg.price_label} {pkg.price}
        </p>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Your Details</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name *</label>
              <input
                name="customer_name"
                required
                defaultValue={isLoggedInAs("user") ? user?.name || "" : ""}
                className="panel-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input
                name="customer_email"
                type="email"
                required
                defaultValue={isLoggedInAs("user") ? user?.email || "" : ""}
                className="panel-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone *</label>
              <input name="customer_phone" required defaultValue={user?.phone || ""} className="panel-input" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Preferred Booking Date *</label>
              <input
                name="booking_date"
                type="date"
                required
                min={todayValue()}
                defaultValue={preselectedDate && preselectedDate >= todayValue() ? preselectedDate : ""}
                className="panel-input"
              />
              <p className="mt-1 text-xs text-muted">
                Select your preferred trek or tour start date.
                {preselectedDate ? " Date chosen from the availability calendar." : ""}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Address *</label>
              <textarea name="customer_address" required rows={2} className="panel-input min-h-[80px]" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
              <textarea name="customer_notes" rows={2} className="panel-input min-h-[80px]" placeholder="Group size, special requests, dietary needs..." />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Choose Payment Method</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setMethod("manual")}
              className={`rounded-xl border p-4 text-left transition ${
                method === "manual" ? "border-primary bg-primary/5" : "border-border hover:bg-surface-muted"
              }`}
            >
              <p className="font-semibold">Manual Payment</p>
              <p className="mt-1 text-sm text-muted">Pay by bank transfer or QR, then upload payment proof.</p>
            </button>
            <button
              type="button"
              onClick={() => setMethod("cod")}
              className={`rounded-xl border p-4 text-left transition ${
                method === "cod" ? "border-primary bg-primary/5" : "border-border hover:bg-surface-muted"
              }`}
            >
              <p className="font-semibold">Cash on Delivery</p>
              <p className="mt-1 text-sm text-muted">Pay in cash on arrival. Booking sent to manager for approval.</p>
            </button>
            <button
              type="button"
              disabled={!options.online_payment_enabled}
              onClick={() => options.online_payment_enabled && setMethod("online")}
              className={`rounded-xl border p-4 text-left transition ${
                method === "online" ? "border-primary bg-primary/5" : "border-border"
              } ${!options.online_payment_enabled ? "opacity-50 cursor-not-allowed" : "hover:bg-surface-muted"}`}
            >
              <p className="font-semibold">Online Payment</p>
              <p className="mt-1 text-sm text-muted">
                {options.online_payment_enabled ? "Pay securely online with card." : "Coming soon."}
              </p>
            </button>
          </div>
        </section>

        {method === "manual" && options.payment_settings ? (
          <section className="space-y-6">
            <PaymentDetailsPanel settings={options.payment_settings} compact />
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <label className="mb-1 block text-sm font-medium">Payment Confirmation Screenshot *</label>
              <p className="mb-3 text-xs text-muted">
                After completing the bank transfer or QR payment, upload a screenshot of the payment confirmation.
              </p>
              <input
                type="file"
                name="payment_proof"
                accept={imageAccept}
                required
                className="block w-full text-sm file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white hover:file:bg-primary-dark"
              />
            </div>
          </section>
        ) : null}

        {method === "cod" ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Your booking request will be sent to a manager for approval. You will pay in cash on delivery after confirmation.
          </div>
        ) : null}

        {error ? <p className="text-red-600">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Booking Request"}
          </button>
          <Link href={`/${pkg.category}/${slug}`} className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
