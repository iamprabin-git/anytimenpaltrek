"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { login } from "@/lib/admin-api";
import { getPortalForgotPassword, setAuthSession, type UserRole } from "@/lib/auth";

interface PortalLoginFormProps {
  role: UserRole;
  title: string;
  subtitle: string;
  defaultEmail?: string;
  showThemeToggle?: boolean;
  showGoogleSignIn?: boolean;
  embedded?: boolean;
}

function portalAutocompleteSection(role: UserRole) {
  if (role === "admin") return "admin-portal";
  if (role === "agent") return "agent-portal";
  return "customer-portal";
}

export default function PortalLoginForm({
  role,
  title,
  subtitle,
  defaultEmail,
  showThemeToggle = true,
  showGoogleSignIn = true,
  embedded = false,
}: PortalLoginFormProps) {
  const autocompleteSection = portalAutocompleteSection(role);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function defaultHome() {
    return role === "admin" ? "/admin" : role === "agent" ? "/agent" : "/account";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login(
        role,
        formData.get("email") as string,
        formData.get("password") as string
      );
      setAuthSession(result.token, result.user);
      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : defaultHome());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${embedded ? "" : "relative flex min-h-screen items-center justify-center bg-surface-muted p-4"}`}>
      {showThemeToggle && !embedded ? (
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
      ) : null}
      <div className={`${embedded ? "w-full" : "w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-lg"}`}>
        <div className={embedded ? "mb-8 border-b border-border/70 pb-8" : "mb-8"}>
          {!embedded ? (
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          ) : null}
          <h1
            className={`tracking-tight text-foreground ${
              embedded ? "font-serif text-3xl font-normal sm:text-4xl" : "text-2xl font-bold sm:text-[1.75rem]"
            }`}
          >
            {title}
          </h1>
          <p className={`leading-relaxed text-muted ${embedded ? "mt-3 text-sm sm:text-base" : "mt-2 text-sm"}`}>
            {subtitle}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5" method="post" autoComplete="on">
          <div>
            <label htmlFor={`${role}-login-email`} className="mb-2 block text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              id={`${role}-login-email`}
              name="email"
              type="email"
              required
              defaultValue={defaultEmail}
              autoComplete={`section-${autocompleteSection} username email`}
              className={embedded ? "portal-login-input" : "panel-input"}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor={`${role}-login-password`} className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Link href={getPortalForgotPassword(role)} className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id={`${role}-login-password`}
              name="password"
              type="password"
              required
              autoComplete={`section-${autocompleteSection} current-password`}
              className={embedded ? "portal-login-input" : "panel-input"}
            />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full disabled:opacity-50 ${
              embedded
                ? "rounded-xl bg-foreground px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-foreground/90"
                : "btn-primary py-3 text-sm font-semibold"
            }`}
          >
            {loading ? "Signing in..." : embedded ? "Sign in" : "Sign In"}
          </button>
        </form>
        {showGoogleSignIn && (role === "user" || role === "agent") && (
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-muted">Or</span>
              </div>
            </div>
            <GoogleSignInButton portal={role} mode="login" />
          </div>
        )}
      </div>
    </div>
  );
}
