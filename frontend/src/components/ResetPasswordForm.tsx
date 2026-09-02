"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { resetPassword } from "@/lib/admin-api";
import { getPortalLogin, type UserRole } from "@/lib/auth";

interface ResetPasswordFormProps {
  role: UserRole;
  title?: string;
  subtitle?: string;
  embedded?: boolean;
}

export default function ResetPasswordForm({
  role,
  title = "Reset Password",
  subtitle = "Choose a new password for your account.",
  embedded = false,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const missingParams = useMemo(() => !token || !email, [token, email]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const passwordConfirmation = formData.get("password_confirmation") as string;

    if (password !== passwordConfirmation) {
      setError("Password and confirm password do not match.");
      setLoading(false);
      return;
    }

    try {
      const result = await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
        portal: role,
      });
      setMessage(result.message);
      setTimeout(() => router.push(getPortalLogin(role)), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${embedded ? "" : "min-h-screen flex items-center justify-center p-4 bg-surface-muted"}`}>
      <div className={`${embedded ? "w-full" : "bg-surface border border-border rounded-xl shadow-lg p-8 w-full max-w-md"}`}>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted text-sm mb-8">{subtitle}</p>

        {missingParams ? (
          <div className="space-y-4">
            <p className="text-red-600 text-sm">This reset link is invalid or incomplete.</p>
            <Link href={getPortalLogin(role)} className="text-primary font-semibold text-sm">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} readOnly className="panel-input bg-surface-muted" />
            </div>
            <div>
              <label htmlFor={`${role}-reset-password`} className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                id={`${role}-reset-password`}
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="panel-input"
              />
            </div>
            <div>
              <label htmlFor={`${role}-reset-password-confirmation`} className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input
                id={`${role}-reset-password-confirmation`}
                name="password_confirmation"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="panel-input"
              />
            </div>

            {error ? <p className="text-red-600 text-sm">{error}</p> : null}
            {message ? <p className="text-green-600 text-sm">{message}</p> : null}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-muted">
          <Link href={getPortalLogin(role)} className="text-primary font-semibold">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
