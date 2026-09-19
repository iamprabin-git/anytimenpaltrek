import type { Package } from "@/types";
import type { AuthUser } from "@/lib/auth";
import { getAuthToken } from "@/lib/auth";
import { submitForm } from "@/lib/form-upload";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function agentFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/agent/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `API error: ${res.status}`);
  }

  return res.json();
}

export interface AgentUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  address: string | null;
  document_id: string | null;
  whatsapp_number: string | null;
  social_links: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
  } | null;
  avatar: string | null;
  avatar_url: string | null;
  registration_source: string | null;
  status: string;
  loyalty_points?: number;
  created_at: string;
  creator?: { id: number; name: string } | null;
  interaction_count?: number;
  bookings_count?: number;
}

export interface AgentReview {
  id: number;
  author_name: string;
  author_country: string | null;
  author_avatar?: string | null;
  gallery_images?: string[] | null;
  rating: number;
  content: string;
  status: string;
  created_at: string;
}

export interface AgentInquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

export interface AgentBooking {
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
  payment_proof_url: string | null;
  status: string;
  review_note: string | null;
  approved_at: string | null;
  created_at: string;
  package: { id: number; title: string; slug: string; category?: string | null };
  user?: { id: number; name: string; email: string } | null;
  approver?: { id: number; name: string } | null;
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

export async function getAgentDashboard() {
  return agentFetch<{ stats: Record<string, number | string> }>("/agent/dashboard");
}

export interface AgentAnalytics {
  period_days: number;
  sales: {
    total_revenue: number;
    period_revenue: number;
    previous_period_revenue: number;
    revenue_growth_percent: number | null;
    paid_bookings: number;
    period_paid_bookings: number;
    period_booking_requests: number;
    pending_bookings: number;
    average_order_value: number;
  };
  user_behavior: {
    total_customers: number;
    active_customers: number;
    new_customers: number;
    period_inquiries: number;
    total_inquiries: number;
    period_reviews: number;
    period_wishlist_saves: number;
    registrations_by_source: Array<{ source: string; count: number }>;
  };
  conversion: {
    inquiry_to_booking_rate: number;
    registration_to_booking_rate: number;
    booking_to_paid_rate: number;
    period_booking_to_paid_rate: number;
  };
  revenue_trend: Array<{ label: string; revenue: number; bookings: number }>;
  top_packages: Array<{ package_id: number | null; title: string; revenue: number; bookings: number }>;
  payment_methods: Array<{ method: string; revenue: number; bookings: number }>;
  booking_status_breakdown: Array<{ status: string; count: number }>;
}

export async function getAgentAnalytics(days = 30) {
  return agentFetch<AgentAnalytics>(`/agent/analytics?days=${days}`);
}

export async function refreshAuthUser() {
  return agentFetch<AuthUser>("/auth/me");
}

export async function getAgentPackages(category?: string) {
  const query = category ? `?category=${category}` : "";
  return agentFetch<Package[]>(`/agent/packages${query}`);
}

export async function createAgentPackage(payload: Partial<Package>) {
  return agentFetch<{ message: string; package: Package }>("/agent/packages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAgentPackage(id: number, payload: Partial<Package>) {
  return agentFetch<{ message: string; package: Package }>(`/agent/packages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function saveAgentPackageForm(id: number | null, formData: FormData) {
  const token = getAuthToken();

  if (id) {
    return submitForm<{ message: string; package: Package }>(
      `/agent/packages/${id}`,
      "POST",
      formData,
      { token, redirectOnAuthError: "/agent/login" }
    );
  }

  return submitForm<{ message: string; package: Package }>(
    "/agent/packages",
    "POST",
    formData,
    { token, redirectOnAuthError: "/agent/login" }
  );
}

export async function deleteAgentPackage(id: number) {
  return agentFetch<{ message: string }>(`/agent/packages/${id}`, { method: "DELETE" });
}

export async function getAgentBlogPosts() {
  return agentFetch<import("@/types").BlogPost[]>("/agent/blog-posts");
}

export async function saveAgentBlogPostForm(id: number | null, formData: FormData) {
  const token = getAuthToken();
  const path = id ? `/agent/blog-posts/${id}` : "/agent/blog-posts";

  return submitForm<{ message: string; post: import("@/types").BlogPost }>(path, "POST", formData, {
    token,
    redirectOnAuthError: "/agent/login",
  });
}

export async function deleteAgentBlogPost(id: number) {
  return agentFetch<{ message: string }>(`/agent/blog-posts/${id}`, { method: "DELETE" });
}

export async function getAgentUsers(options?: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.search) params.set("search", options.search);
  const query = params.toString() ? `?${params.toString()}` : "";
  return agentFetch<AgentUser[]>(`/agent/users${query}`);
}

export async function saveAgentUserForm(id: number | null, formData: FormData) {
  const token = getAuthToken();

  if (id) {
    return submitForm<{ message: string; user: AgentUser }>(
      `/agent/users/${id}`,
      "POST",
      formData,
      { token, redirectOnAuthError: "/agent/login" }
    );
  }

  return submitForm<{ message: string; user: AgentUser }>(
    "/agent/users",
    "POST",
    formData,
    { token, redirectOnAuthError: "/agent/login" }
  );
}

export async function exportAgentUsers(options?: { status?: string; search?: string }) {
  const token = getAuthToken();
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.search) params.set("search", options.search);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/agent/users/export${query}`, {
    headers: {
      Accept: "text/csv",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/agent/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Export failed (${res.status})`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] || "customers.csv";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function approveAgentUser(id: number) {
  return agentFetch<{ message: string }>(`/agent/users/${id}/approve`, { method: "POST" });
}

export async function rejectAgentUser(id: number) {
  return agentFetch<{ message: string }>(`/agent/users/${id}/reject`, { method: "POST" });
}

export async function deleteAgentUser(id: number) {
  return agentFetch<{ message: string }>(`/agent/users/${id}`, { method: "DELETE" });
}

export async function getAgentPaymentSettings() {
  return agentFetch<{ payment_settings: PaymentSettingsData }>("/agent/payment-settings");
}

export async function updateAgentPaymentSettingsForm(formData: FormData) {
  return submitForm<{ message: string; payment_settings: PaymentSettingsData }>(
    "/agent/payment-settings",
    "POST",
    formData,
    { token: getAuthToken(), redirectOnAuthError: "/agent/login" }
  );
}

export async function getAgentReviews(status?: string) {
  const query = status ? `?status=${status}` : "";
  return agentFetch<AgentReview[]>(`/agent/reviews${query}`);
}

export async function approveAgentReview(id: number) {
  return agentFetch<{ message: string }>(`/agent/reviews/${id}/approve`, { method: "POST" });
}

export async function rejectAgentReview(id: number) {
  return agentFetch<{ message: string }>(`/agent/reviews/${id}/reject`, { method: "POST" });
}

export async function deleteAgentReview(id: number) {
  return agentFetch<{ message: string }>(`/agent/reviews/${id}`, { method: "DELETE" });
}

export async function getAgentInquiries() {
  return agentFetch<AgentInquiry[]>("/agent/inquiries");
}

export async function updateAgentInquiryStatus(id: number, status: string) {
  return agentFetch<{ message: string }>(`/agent/inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getAgentBookings(options?: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.search) params.set("search", options.search);
  const query = params.toString() ? `?${params.toString()}` : "";
  return agentFetch<AgentBooking[]>(`/agent/bookings${query}`);
}

export async function exportAgentBookings(options?: { status?: string; search?: string }) {
  const token = getAuthToken();
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.search) params.set("search", options.search);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_URL}/agent/bookings/export${query}`, {
    headers: {
      Accept: "text/csv",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/agent/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Export failed (${res.status})`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] || "bookings.csv";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function approveAgentBooking(id: number, reviewNote?: string) {
  return agentFetch<{ message: string; booking: AgentBooking }>(`/agent/bookings/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ review_note: reviewNote }),
  });
}

export async function rejectAgentBooking(id: number, reviewNote?: string) {
  return agentFetch<{ message: string; booking: AgentBooking }>(`/agent/bookings/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ review_note: reviewNote }),
  });
}

export interface AgentProfile extends AuthUser {
  agent_role_label?: string | null;
  created_at?: string;
}

export async function getAgentProfile() {
  return agentFetch<AgentProfile>("/agent/profile");
}

export async function updateAgentProfile(payload: {
  name?: string;
  phone?: string;
  country?: string;
  password?: string;
  password_confirmation?: string;
}) {
  return agentFetch<{ message: string; user: AuthUser }>("/agent/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateAgentProfileForm(formData: FormData) {
  return submitForm<{ message: string; user: AuthUser }>("/agent/profile", "POST", formData, {
    token: getAuthToken(),
    redirectOnAuthError: "/agent/login",
  });
}

export interface PendingChange {
  id: number;
  action: string;
  target_type: string;
  target_id: number | null;
  payload: Record<string, unknown>;
  summary: string;
  status: "pending" | "approved" | "rejected";
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  requester?: {
    id: number;
    name: string;
    email: string;
    agent_role: string;
    agent_role_label?: string;
  } | null;
  reviewer?: { id: number; name: string } | null;
}

export async function getAgentApprovals(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return agentFetch<{
    can_review: boolean;
    pending_count: number;
    changes: PendingChange[];
  }>(`/agent/approvals${query}`);
}

export async function approveAgentChange(id: number, reviewNote?: string) {
  return agentFetch<{ message: string; change: PendingChange }>(`/agent/approvals/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ review_note: reviewNote }),
  });
}

export async function rejectAgentChange(id: number, reviewNote?: string) {
  return agentFetch<{ message: string; change: PendingChange }>(`/agent/approvals/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ review_note: reviewNote }),
  });
}

export interface CrmTimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  occurred_at: string;
  metadata?: Record<string, unknown>;
}

export interface CrmRecentInteraction {
  id: number;
  type: string;
  title: string;
  description: string | null;
  customer_name: string | null;
  customer_id: number | null;
  agent_name: string | null;
  created_at: string;
}

export interface CrmSummary {
  stats: {
    active_customers: number;
    pending_customers: number;
    loyalty_members: number;
    draft_campaigns: number;
    sent_campaigns: number;
  };
  recent_interactions: CrmRecentInteraction[];
  segments: Record<string, string>;
  campaign_types: Record<string, string>;
  channels?: Record<string, string>;
  brevo?: BrevoIntegrationStatus;
}

export interface BrevoIntegrationStatus {
  enabled: boolean;
  configured: boolean;
  api_key_set: boolean;
  sender_email: string | null;
  sender_name: string;
  list_id: number | null;
  sync_contacts: boolean;
  provider: string;
}

export interface CrmCampaign {
  id: number;
  name: string;
  campaign_type: string;
  segment: string;
  segment_value: string | null;
  subject: string;
  message: string;
  channels?: string[];
  status: string;
  recipient_count: number;
  email_sent_count?: number;
  whatsapp_sent_count?: number;
  in_app_sent_count?: number;
  sent_at: string | null;
  created_at: string;
  creator?: { id: number; name: string } | null;
}

export interface CrmCampaignRecipient {
  id: number;
  channel: string;
  status: string;
  sent_at: string | null;
  delivery_meta?: {
    whatsapp_url?: string;
    whatsapp_number?: string;
    email?: string;
    reason?: string;
    error?: string;
    message?: string;
  } | null;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    whatsapp_number: string | null;
    country: string | null;
  } | null;
}

export async function getCrmSummary() {
  return agentFetch<CrmSummary>("/agent/crm/summary");
}

export async function getCrmCustomers(options?: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.search) params.set("search", options.search);
  const query = params.toString() ? `?${params.toString()}` : "";
  return agentFetch<AgentUser[]>(`/agent/crm/customers${query}`);
}

export async function getCrmCustomer(id: number) {
  return agentFetch<{ customer: AgentUser; timeline: CrmTimelineEvent[] }>(`/agent/crm/customers/${id}`);
}

export async function createCrmInteraction(
  userId: number,
  payload: { type: "note" | "call" | "email"; title: string; description?: string }
) {
  return agentFetch<{ message: string; timeline: CrmTimelineEvent[] }>(`/agent/crm/customers/${userId}/interactions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCrmLoyalty(userId: number, payload: { loyalty_points: number; note?: string }) {
  return agentFetch<{ message: string; customer: AgentUser; timeline: CrmTimelineEvent[] }>(
    `/agent/crm/customers/${userId}/loyalty`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function getCrmCampaigns() {
  return agentFetch<CrmCampaign[]>("/agent/crm/campaigns");
}

export async function createCrmCampaign(payload: {
  name: string;
  campaign_type: string;
  segment: string;
  segment_value?: string;
  subject: string;
  message: string;
  channels?: string[];
  send_now?: boolean;
}) {
  return agentFetch<{ message: string; campaign: CrmCampaign }>("/agent/crm/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendCrmCampaign(id: number) {
  return agentFetch<{ message: string; campaign: CrmCampaign }>(`/agent/crm/campaigns/${id}/send`, {
    method: "POST",
  });
}

export async function getCrmCampaignRecipients(id: number) {
  return agentFetch<{ campaign: CrmCampaign; recipients: CrmCampaignRecipient[] }>(`/agent/crm/campaigns/${id}/recipients`);
}
