export type UserRole = "admin" | "agent" | "user";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  phone?: string | null;
  country?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  agent_role?: string | null;
  permissions?: string[];
}

export function hasPermission(permission: string, user?: AuthUser | null): boolean {
  const resolved = user ?? getAuthUser();
  return resolved?.permissions?.includes(permission) ?? false;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const AUTH_SESSION_EVENT = "auth-session-changed";

function notifyAuthSessionChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function subscribeToAuthSession(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => listener();
  window.addEventListener(AUTH_SESSION_EVENT, handler);

  return () => window.removeEventListener(AUTH_SESSION_EVENT, handler);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthSessionChanged();
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthSessionChanged();
}

export function isLoggedInAs(role: UserRole): boolean {
  const user = getAuthUser();
  return !!getAuthToken() && user?.role === role && user?.status === "active";
}

export function getPortalHome(role: UserRole): string {
  if (role === "admin") return "/admin";
  if (role === "agent") return "/agent";
  return "/account";
}

export function getPortalLogin(role: UserRole): string {
  if (role === "admin") return "/admin/login";
  if (role === "agent") return "/agent/login";
  return "/login";
}

export function getPortalForgotPassword(role: UserRole): string {
  return `${getPortalLogin(role)}/forgot-password`;
}

export function getPortalResetPassword(role: UserRole): string {
  return `${getPortalLogin(role)}/reset-password`;
}

export function isPortalAuthPage(pathname: string, role: UserRole): boolean {
  const loginPath = getPortalLogin(role);
  return pathname === loginPath || pathname.startsWith(`${loginPath}/`);
}

export function getPortalProfile(role: UserRole): string {
  if (role === "admin") return "/admin/profile";
  if (role === "agent") return "/agent/profile";
  return "/account";
}

// Legacy helpers used by older admin code
export const getAdminToken = getAuthToken;
export const setAdminToken = (token: string) => {
  const user = getAuthUser();
  if (user) setAuthSession(token, user);
  else localStorage.setItem(TOKEN_KEY, token);
};
export const clearAdminToken = clearAuthSession;
export const isAdminLoggedIn = () => isLoggedInAs("admin");
