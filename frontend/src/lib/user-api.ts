import type { AuthUser } from "@/lib/auth";
import { getAuthToken } from "@/lib/auth";
import { submitForm } from "@/lib/form-upload";
import type { Package } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function userFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `API error: ${res.status}`);
  }

  return res.json();
}

export interface UserBooking {
  id: number;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  booking_date?: string | null;
  payment_method?: string | null;
  payment_proof_url?: string | null;
  review_note?: string | null;
  approved_at?: string | null;
  package: Pick<Package, "id" | "title" | "slug" | "image" | "category" | "price" | "price_label"> & {
    image_url?: string | null;
  };
}

export interface PaymentSettingsData {
  enabled: boolean;
  title: string;
  instructions: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
  swift_code: string;
  qr_code_url: string | null;
}

export async function getUserProfile() {
  return userFetch<AuthUser>("/user/profile");
}

export async function updateUserProfile(payload: {
  name?: string;
  phone?: string;
  country?: string;
  password?: string;
  password_confirmation?: string;
}) {
  return userFetch<{ message: string; user: AuthUser }>("/user/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateUserProfileForm(formData: FormData) {
  return submitForm<{ message: string; user: AuthUser }>("/user/profile", "POST", formData, {
    token: getAuthToken(),
    redirectOnAuthError: "/login",
  });
}

export async function getUserBookings() {
  return userFetch<UserBooking[]>("/user/bookings");
}

export const getUserPayments = getUserBookings;

async function downloadUserCsv(filename: string) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/user/bookings/export`, {
    headers: {
      Accept: "text/csv",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Export failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function exportUserBookings() {
  const date = new Date().toISOString().slice(0, 10);
  return downloadUserCsv(`my-bookings-${date}.csv`);
}

export async function exportUserPayments() {
  const date = new Date().toISOString().slice(0, 10);
  return downloadUserCsv(`my-payments-${date}.csv`);
}

export async function getUserPaymentSettings() {
  return userFetch<{ payment_settings: PaymentSettingsData | null; online_payment_enabled: boolean }>(
    "/user/payment-settings"
  );
}

export interface StaffMessage {
  id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  created_at: string;
  package: Pick<Package, "id" | "title" | "slug" | "image" | "category" | "price" | "price_label"> & {
    image_url?: string | null;
  };
}

export interface UserSuggestion {
  id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface UserPhoto {
  id: number;
  caption: string | null;
  image_url: string;
  created_at: string;
}

export async function getStaffMessages() {
  return userFetch<StaffMessage[]>("/user/staff-messages");
}

export async function sendStaffMessage(payload: { subject: string; message: string }) {
  return userFetch<{ message: string; inquiry: StaffMessage }>("/user/staff-messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getWishlist() {
  return userFetch<WishlistItem[]>("/user/wishlist");
}

export async function addToWishlist(packageSlug: string) {
  return userFetch<{ message: string; item: WishlistItem }>("/user/wishlist", {
    method: "POST",
    body: JSON.stringify({ package_slug: packageSlug }),
  });
}

export async function removeFromWishlist(id: number) {
  return userFetch<{ message: string }>(`/user/wishlist/${id}`, { method: "DELETE" });
}

export async function getSuggestions() {
  return userFetch<UserSuggestion[]>("/user/suggestions");
}

export async function submitSuggestion(payload: { subject: string; message: string }) {
  return userFetch<{ message: string; suggestion: UserSuggestion }>("/user/suggestions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getUserPhotos() {
  return userFetch<UserPhoto[]>("/user/photos");
}

export async function uploadUserPhoto(formData: FormData) {
  return submitForm<{ message: string; photo: UserPhoto }>("/user/photos", "POST", formData, {
    token: getAuthToken(),
    redirectOnAuthError: "/login",
  });
}

export async function deleteUserPhoto(id: number) {
  return userFetch<{ message: string }>(`/user/photos/${id}`, { method: "DELETE" });
}
