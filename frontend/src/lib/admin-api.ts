import type { AuthUser, UserRole } from "@/lib/auth";
import { getAuthToken, getPortalLogin } from "@/lib/auth";
import { submitForm } from "@/lib/form-upload";
import type { SiteContentMap } from "@/types/site-content";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, options?: RequestInit, portal?: UserRole): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });

  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    if (!path.includes("/auth/login") && !path.includes("/auth/register")) {
      if (typeof window !== "undefined" && portal) {
        const loginPath = getPortalLogin(portal);
        if (window.location.pathname !== loginPath) {
          window.location.href = loginPath;
        }
      }
    }
    throw new Error((data as { message?: string }).message || "Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `API error: ${res.status}`);
  }

  return res.json();
}

export async function login(portal: UserRole, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, portal }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Login failed");
  return data as { token: string; user: AuthUser };
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  country?: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || "Registration failed");
  return data as { message: string };
}

export async function requestPasswordReset(email: string, portal: UserRole) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, portal }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string }).message ||
      Object.values((data as { errors?: Record<string, string[]> }).errors || {})[0]?.[0] ||
      "Unable to send reset link";
    throw new Error(message);
  }
  return data as { message: string };
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
  portal: UserRole;
}) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string }).message ||
      Object.values((data as { errors?: Record<string, string[]> }).errors || {})[0]?.[0] ||
      "Unable to reset password";
    throw new Error(message);
  }
  return data as { message: string };
}

export async function logout() {
  return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
}

export interface CompanySettings {
  id: number;
  company_name: string;
  logo: string | null;
  logo_url?: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  dynamic_settings: Record<string, unknown> | null;
}

export interface AdminAgent {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  agent_role: string;
  agent_role_label?: string;
  permissions?: string[];
  status: string;
  created_at: string;
}

export interface RolePermissionsData {
  roles: Record<string, string>;
  catalog: Record<string, string>;
  permissions: Record<string, string[]>;
}

export async function getAdminDashboard() {
  return apiFetch<{ stats: Record<string, number | string>; company: CompanySettings }>(
    "/admin/dashboard",
    undefined,
    "admin"
  );
}

export async function getAdminProfile() {
  return apiFetch<AuthUser>("/admin/profile", undefined, "admin");
}

export async function updateAdminProfile(payload: {
  name?: string;
  phone?: string;
  country?: string;
  password?: string;
  password_confirmation?: string;
}) {
  return apiFetch<{ message: string; user: AuthUser }>("/admin/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "admin");
}

export async function updateAdminProfileForm(formData: FormData) {
  return submitForm<{ message: string; user: AuthUser }>("/admin/profile", "POST", formData, {
    token: getAuthToken(),
    redirectOnAuthError: "/admin/login",
  });
}

export async function getAdminAgents() {
  return apiFetch<{ agents: AdminAgent[]; roles: Record<string, string> }>("/admin/agents", undefined, "admin");
}

export async function createAdminAgent(payload: {
  name: string;
  email: string;
  phone: string;
  agent_role: string;
  password: string;
  password_confirmation: string;
}) {
  return apiFetch<{ message: string; agent: AdminAgent }>("/admin/agents", {
    method: "POST",
    body: JSON.stringify(payload),
  }, "admin");
}

export async function updateAdminAgent(
  id: number,
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    agent_role?: string;
    status?: string;
    password?: string;
    password_confirmation?: string;
  }
) {
  return apiFetch<{ message: string; agent: AdminAgent }>(`/admin/agents/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "admin");
}

export async function deleteAdminAgent(id: number) {
  return apiFetch<{ message: string }>(`/admin/agents/${id}`, { method: "DELETE" }, "admin");
}

export async function getRolePermissions() {
  return apiFetch<RolePermissionsData>("/admin/role-permissions", undefined, "admin");
}

export async function updateRolePermissions(permissions: Record<string, string[]>) {
  return apiFetch<{ message: string; permissions: Record<string, string[]> }>("/admin/role-permissions", {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  }, "admin");
}

export async function updateSingleRolePermissions(role: string, permissions: string[]) {
  return apiFetch<{ message: string; permissions: Record<string, string[]> }>(
    `/admin/role-permissions/${encodeURIComponent(role)}`,
    {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    },
    "admin"
  );
}

export async function getAdminCompanySettings() {
  return apiFetch<CompanySettings>("/admin/company-settings", undefined, "admin");
}

export async function updateAdminCompanySettings(payload: Partial<CompanySettings>) {
  return apiFetch<{ message: string; settings: CompanySettings }>("/admin/company-settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  }, "admin");
}

export async function updateAdminCompanySettingsForm(formData: FormData) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const res = await fetch(`${API_URL}/admin/company-settings`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `API error: ${res.status}`);
  }

  return data as { message: string; settings: CompanySettings };
}

export async function getAdminSiteContent(locale = "en") {
  return apiFetch<{ locale: string; content: SiteContentMap }>(`/admin/site-content?locale=${locale}`, undefined, "admin");
}

export async function updateAdminSiteContent(content: Partial<SiteContentMap>, locale = "en") {
  return apiFetch<{ message: string; locale: string; content: SiteContentMap }>("/admin/site-content", {
    method: "PUT",
    body: JSON.stringify({ ...content, locale }),
  }, "admin");
}

export async function updateAdminPageSectionsForm(formData: FormData) {
  return submitForm<{ message: string; locale: string; content: SiteContentMap }>(
    "/admin/site-content/page_sections",
    "POST",
    formData,
    { token: getAuthToken(), redirectOnAuthError: "/admin/login" }
  );
}

export async function updateAdminFooterForm(formData: FormData) {
  return submitForm<{ message: string; locale: string; content: SiteContentMap }>(
    "/admin/site-content/footer",
    "POST",
    formData,
    { token: getAuthToken(), redirectOnAuthError: "/admin/login" }
  );
}

export async function getAdminHeroSlides() {
  return apiFetch<import("@/types").HeroSlide[]>("/admin/hero-slides", undefined, "admin");
}

export async function saveAdminHeroSlideForm(id: number | null, formData: FormData) {
  const path = id ? `/admin/hero-slides/${id}` : "/admin/hero-slides";
  return submitForm<{ message: string; slide: import("@/types").HeroSlide }>(path, "POST", formData, {
    token: getAuthToken(),
    redirectOnAuthError: "/admin/login",
  });
}

export async function deleteAdminHeroSlide(id: number) {
  return apiFetch<{ message: string }>(`/admin/hero-slides/${id}`, { method: "DELETE" }, "admin");
}

export async function getAdminDestinations() {
  return apiFetch<import("@/types").Destination[]>("/admin/destinations", undefined, "admin");
}

export async function saveAdminDestinationForm(id: number | null, formData: FormData) {
  const path = id ? `/admin/destinations/${id}` : "/admin/destinations";
  return submitForm<{ message: string; destination: import("@/types").Destination }>(path, "POST", formData, {
    token: getAuthToken(),
    redirectOnAuthError: "/admin/login",
  });
}

export async function deleteAdminDestination(id: number) {
  return apiFetch<{ message: string }>(`/admin/destinations/${id}`, { method: "DELETE" }, "admin");
}
