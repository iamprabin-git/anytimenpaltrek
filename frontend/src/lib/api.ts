import type { BlogPost, CompanySettings, HomeData, Package } from "@/types";
import type { SiteContentMap } from "@/types/site-content";
import { getAuthToken } from "@/lib/auth";
import { DEFAULT_LOCALE, type LocaleCode } from "@/lib/i18n/locales";
import { submitForm } from "@/lib/form-upload";
import type { PaymentSettingsData } from "@/lib/user-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function localeQuery(locale?: string): string {
  const resolved = locale || DEFAULT_LOCALE;
  return `locale=${encodeURIComponent(resolved)}`;
}

async function fetchApi<T>(path: string, options?: RequestInit, locale?: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const localizedPath = `${path}${separator}${localeQuery(locale)}`;

  const res = await fetch(`${API_URL}${localizedPath}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Locale": locale || DEFAULT_LOCALE,
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `API error: ${res.status}`);
  }

  return res.json();
}

export async function getHomeData(locale: LocaleCode = DEFAULT_LOCALE): Promise<HomeData> {
  const data = await fetchApi<HomeData & { site_content?: SiteContentMap }>("/home", undefined, locale);
  return data;
}

export async function getSiteContent(locale: LocaleCode = DEFAULT_LOCALE): Promise<SiteContentMap> {
  const data = await fetchApi<{ content: SiteContentMap }>("/site-content", undefined, locale);
  return data.content;
}

export async function getCompanySettings(locale: LocaleCode = DEFAULT_LOCALE): Promise<CompanySettings> {
  return fetchApi<CompanySettings>("/company-settings", undefined, locale);
}

export async function getPackages(category?: string, locale: LocaleCode = DEFAULT_LOCALE): Promise<Package[]> {
  const path = category ? `/packages?category=${encodeURIComponent(category)}` : "/packages";
  return fetchApi<Package[]>(path, undefined, locale);
}

export async function getPackage(slug: string, locale: LocaleCode = DEFAULT_LOCALE): Promise<Package> {
  return fetchApi<Package>(`/packages/${slug}`, undefined, locale);
}

export type PackageAvailabilityStatus = "past" | "available" | "limited" | "full";

export interface PackageAvailabilityDay {
  date: string;
  end_date: string;
  duration_days: number;
  booked_seats: number;
  available_seats: number;
  total_seats: number;
  status: PackageAvailabilityStatus;
}

export interface PackageAvailabilityMonth {
  package: {
    id: number;
    slug: string;
    title: string;
    duration_days: number;
    price: string | number | null;
    price_label: string;
    group_size_max: number;
  };
  month: string;
  total_seats: number;
  days: PackageAvailabilityDay[];
}

export async function getPackageAvailability(
  slug: string,
  year: number,
  month: number,
  locale: LocaleCode = DEFAULT_LOCALE
): Promise<PackageAvailabilityMonth> {
  return fetchApi<PackageAvailabilityMonth>(
    `/packages/${encodeURIComponent(slug)}/availability?year=${year}&month=${month}`,
    undefined,
    locale
  );
}

export async function checkPackageAvailabilityDate(
  slug: string,
  date: string,
  locale: LocaleCode = DEFAULT_LOCALE
): Promise<{ day: PackageAvailabilityDay }> {
  return fetchApi<{ day: PackageAvailabilityDay }>(
    `/packages/${encodeURIComponent(slug)}/availability?date=${encodeURIComponent(date)}`,
    undefined,
    locale
  );
}

export async function getBlogPosts(locale: LocaleCode = DEFAULT_LOCALE): Promise<BlogPost[]> {
  return fetchApi<BlogPost[]>("/blog-posts", undefined, locale);
}

export async function getBlogPost(slug: string, locale: LocaleCode = DEFAULT_LOCALE): Promise<BlogPost> {
  return fetchApi<BlogPost>(`/blog-posts/${slug}`, undefined, locale);
}

export async function getReviews(locale: LocaleCode = DEFAULT_LOCALE): Promise<import("@/types").Review[]> {
  return fetchApi<import("@/types").Review[]>("/reviews", undefined, locale);
}

export async function submitContact(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<{ message: string }> {
  return fetchApi<{ message: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function submitReview(data: {
  author_name: string;
  author_country?: string;
  rating: number;
  content: string;
}): Promise<{ message: string }> {
  return fetchApi<{ message: string }>("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function submitReviewForm(formData: FormData): Promise<{ message: string }> {
  return submitForm<{ message: string }>("/user/reviews", "POST", formData, {
    token: getAuthToken(),
    redirectOnAuthError: "/login?redirect=/reviews/write",
  });
}

export interface CheckoutSessionResult {
  booking_id: number;
  manual_payment: boolean;
  checkout_url?: string;
  redirect_url?: string;
  message?: string;
  payment_settings?: PaymentSettingsData;
}

export interface CheckoutOptions {
  package: Pick<Package, "id" | "title" | "slug" | "price" | "price_label" | "short_description" | "category">;
  payment_settings: PaymentSettingsData | null;
  online_payment_enabled: boolean;
}

export interface BookingRecord {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  customer_notes: string | null;
  booking_date: string | null;
  amount: string;
  currency: string;
  payment_method: string | null;
  payment_proof_url?: string | null;
  status: string;
  review_note?: string | null;
  approved_at?: string | null;
  created_at: string;
  package: Pick<Package, "id" | "title" | "slug" | "price" | "price_label"> | null;
}

export interface ManualBookingResult {
  booking: BookingRecord;
  payment_settings: PaymentSettingsData | null;
}

export async function getCheckoutOptions(packageSlug: string) {
  return fetchApi<CheckoutOptions>(`/payments/checkout-options?package_slug=${encodeURIComponent(packageSlug)}`, {
    cache: "no-store",
  });
}

export async function submitBookingRequest(formData: FormData) {
  const token = getAuthToken();

  return submitForm<{ message: string; booking: BookingRecord; redirect_url: string }>(
    "/payments/bookings",
    "POST",
    formData,
    { token: token || undefined }
  );
}

export async function createCheckoutSession(data: {
  package_slug: string;
  customer_name: string;
  customer_email: string;
}): Promise<CheckoutSessionResult> {
  const token = getAuthToken();

  return fetchApi<CheckoutSessionResult>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function getManualBookingInstructions(bookingId: number, email: string) {
  return fetchApi<ManualBookingResult>(
    `/payments/manual-booking?booking_id=${bookingId}&email=${encodeURIComponent(email)}`,
    { cache: "no-store" }
  );
}

export async function verifyPayment(sessionId: string) {
  return fetchApi<{ booking: unknown }>(`/payments/verify?session_id=${encodeURIComponent(sessionId)}`, {
    cache: "no-store",
  });
}
