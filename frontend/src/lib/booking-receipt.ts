import type { AuthUser } from "@/lib/auth";
import type { AgentBooking } from "@/lib/agent-api";
import type { UserBooking } from "@/lib/user-api";

export interface BookingReceiptData {
  id: number;
  created_at: string;
  booking_date?: string | null;
  amount: string;
  currency: string;
  payment_method?: string | null;
  status: string;
  review_note?: string | null;
  approved_at?: string | null;
  package: { title: string; category?: string | null };
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string | null;
  customer_address?: string | null;
  customer_notes?: string | null;
  payment_proof_url?: string | null;
  approver_name?: string | null;
}

export function bookingStatusLabel(status: string) {
  switch (status) {
    case "pending_approval":
    case "pending":
      return "Pending manager approval";
    case "confirmed":
      return "Confirmed";
    case "rejected":
      return "Rejected";
    case "paid":
      return "Paid";
    default:
      return status.replace(/_/g, " ");
  }
}

export function paymentStatusLabel(status: string) {
  switch (status) {
    case "paid":
      return "Paid";
    case "confirmed":
      return "Confirmed / paid";
    case "pending_approval":
    case "pending":
      return "Pending approval";
    case "rejected":
      return "Not approved";
    default:
      return status.replace(/_/g, " ");
  }
}

export function isPaidOrConfirmed(status: string) {
  return status === "paid" || status === "confirmed";
}

export function formatMoney(amount: string, currency: string) {
  return `${currency.toUpperCase()} ${amount}`;
}

export function bookingMethodLabel(method: string | null | undefined) {
  switch (method) {
    case "manual":
      return "Manual payment";
    case "cod":
      return "Cash on delivery";
    case "online":
      return "Online payment";
    default:
      return method || "—";
  }
}

export function formatReceiptDate(value: string | null | undefined) {
  if (!value) return "—";
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  return new Date(normalized).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatReceiptDateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function bookingDocumentRef(bookingId: number) {
  return `BK-${String(bookingId).padStart(6, "0")}`;
}

export function userBookingToReceipt(booking: UserBooking, user: AuthUser | null): BookingReceiptData {
  return {
    id: booking.id,
    created_at: booking.created_at,
    booking_date: booking.booking_date,
    amount: booking.amount,
    currency: booking.currency,
    payment_method: booking.payment_method,
    status: booking.status,
    review_note: booking.review_note,
    approved_at: booking.approved_at,
    package: {
      title: booking.package?.title || "Trip booking",
      category: booking.package?.category,
    },
    customer_name: user?.name,
    customer_email: user?.email,
    customer_phone: user?.phone,
    customer_address: user?.country,
    payment_proof_url: booking.payment_proof_url,
  };
}

export function agentBookingToReceipt(booking: AgentBooking): BookingReceiptData {
  return {
    id: booking.id,
    created_at: booking.created_at,
    booking_date: booking.booking_date,
    amount: booking.amount,
    currency: booking.currency,
    payment_method: booking.payment_method,
    status: booking.status,
    review_note: booking.review_note,
    approved_at: booking.approved_at,
    package: {
      title: booking.package.title,
      category: booking.package.category,
    },
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    customer_phone: booking.customer_phone,
    customer_address: booking.customer_address,
    customer_notes: booking.customer_notes,
    payment_proof_url: booking.payment_proof_url,
    approver_name: booking.approver?.name,
  };
}

export type BookingPrintMode =
  | { type: "list"; printedAt: Date }
  | { type: "single"; printedAt: Date; booking: BookingReceiptData };
