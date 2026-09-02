import { getAuthToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface PanelNotificationItem {
  id: string;
  title: string;
  message: string;
  href: string | null;
  category: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  unread_count: number;
  notifications: PanelNotificationItem[];
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function notificationFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `API error: ${res.status}`);
  }

  return res.json();
}

export function getNotifications() {
  return notificationFetch<NotificationsResponse>("/notifications");
}

export function markNotificationRead(id: string) {
  return notificationFetch<{ unread_count: number }>(`/notifications/${id}/read`, { method: "POST" });
}

export function markAllNotificationsRead() {
  return notificationFetch<{ unread_count: number }>("/notifications/read-all", { method: "POST" });
}
