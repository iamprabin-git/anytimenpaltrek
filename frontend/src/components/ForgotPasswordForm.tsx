"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/admin-api";
import { getPortalLogin, type UserRole } from "@/lib/auth";

interface ForgotPasswordFormProps {
  role: UserRole;
  title?: string;
  subtitle?: string;
  defaultEmail?: string;
  embedded?: boolean;
}

export default function ForgotPasswordForm({
  role,
  title = "Forgot Password",
  subtitle = "Enter your email and we will send you a reset link.",
  defaultEmail,
  embedded = false,
}: ForgotPasswordFormProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const email = new FormData(e.currentTarget).get("email") as string;

    try {
      const result = await requestPasswordReset(email, role);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${embedded ? "" : "min-h-screen flex items-center justify-center p-4 bg-surface-muted"}`}>
      <div className={`${embedded ? "w-full" : "bg-surface border border-border rounded-xl shadow-lg p-8 w-full max-w-md"}`}>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted text-sm mb-8">{subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={`${role}-forgot-email`} className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id={`${role}-forgot-email`}
              name="email"
              type="email"
              required
              defaultValue={defaultEmail}
              autoComplete="email"
              className="panel-input"
            />
          </div>

          {error ? <p className="text-red-600 text-sm">{error}</p> : null}
          {message ? <p className="text-green-600 text-sm">{message}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Remember your password?{" "}
          <Link href={getPortalLogin(role)} className="text-primary font-semibold">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
