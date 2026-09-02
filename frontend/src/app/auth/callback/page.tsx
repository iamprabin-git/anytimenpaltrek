"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPortalHome, setAuthSession, type AuthUser, type UserRole } from "@/lib/auth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    const portal = (searchParams.get("portal") || "user") as UserRole;
    const error = searchParams.get("error");
    const info = searchParams.get("message");
    const token = searchParams.get("token");
    const userRaw = searchParams.get("user");

    if (error) {
      setMessage(error);
      return;
    }

    if (info && !token) {
      setMessage(info);
      return;
    }

    if (token && userRaw) {
      try {
        const user = JSON.parse(atob(userRaw)) as AuthUser;
        setAuthSession(token, user);
        router.replace(getPortalHome(user.role));
        return;
      } catch {
        setMessage("Sign-in completed but session data was invalid. Please try again.");
        return;
      }
    }

    setMessage("Sign-in could not be completed. Please try again.");
  }, [router, searchParams]);

  const portal = (searchParams.get("portal") || "user") as UserRole;
  const hasError = !!searchParams.get("error") || (!searchParams.get("token") && !!searchParams.get("message"));
  const loginPath = portal === "agent" ? "/agent/login" : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-muted">
      <div className="bg-surface border border-border rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <p className={`text-sm ${hasError ? "text-red-600" : "text-muted"}`}>{message}</p>
        {hasError && (
          <button
            type="button"
            onClick={() => router.replace(loginPath)}
            className="btn-primary mt-6 w-full"
          >
            Back to {portal === "agent" ? "agent login" : "login"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-muted" />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
