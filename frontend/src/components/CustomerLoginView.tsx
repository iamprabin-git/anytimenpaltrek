"use client";

import { Suspense, useState } from "react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import PortalLoginForm from "@/components/PortalLoginForm";

function CustomerRegisterForm({
  onBack,
  onRegistered,
}: {
  onBack: () => void;
  onRegistered: (message: string) => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const { register } = await import("@/lib/admin-api");
      const result = await register({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        password_confirmation: formData.get("password_confirmation") as string,
        phone: (formData.get("phone") as string) || undefined,
        country: (formData.get("country") as string) || undefined,
      });
      onRegistered(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8 border-b border-border/70 pb-8">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">Create account</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Join us to manage bookings, wishlists, and your travel profile. An agent will approve your account before you can sign in.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label htmlFor="customer-register-name" className="mb-2 block text-sm font-medium text-foreground">
            Full name
          </label>
          <input id="customer-register-name" name="name" required autoComplete="name" className="portal-login-input" />
        </div>
        <div>
          <label htmlFor="customer-register-email" className="mb-2 block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="customer-register-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="portal-login-input"
          />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="customer-register-phone" className="mb-2 block text-sm font-medium text-foreground">
              Phone
            </label>
            <input id="customer-register-phone" name="phone" autoComplete="tel" className="portal-login-input" />
          </div>
          <div>
            <label htmlFor="customer-register-country" className="mb-2 block text-sm font-medium text-foreground">
              Country
            </label>
            <input id="customer-register-country" name="country" autoComplete="country-name" className="portal-login-input" />
          </div>
        </div>
        <div>
          <label htmlFor="customer-register-password" className="mb-2 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="customer-register-password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="portal-login-input"
          />
        </div>
        <div>
          <label htmlFor="customer-register-password-confirmation" className="mb-2 block text-sm font-medium text-foreground">
            Confirm password
          </label>
          <input
            id="customer-register-password-confirmation"
            name="password_confirmation"
            type="password"
            required
            autoComplete="new-password"
            className="portal-login-input"
          />
        </div>
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-foreground px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Create account"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted">Or</span>
          </div>
        </div>
        <GoogleSignInButton portal="user" mode="register" />
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <button type="button" onClick={onBack} className="font-semibold text-primary hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}

function CustomerLoginContent() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");

  if (mode === "register") {
    return (
      <CustomerRegisterForm
        onBack={() => {
          setMode("login");
          setMessage("");
        }}
        onRegistered={(registeredMessage) => {
          setMessage(registeredMessage);
          setMode("login");
        }}
      />
    );
  }

  return (
    <div>
      <Suspense fallback={<p className="text-center text-muted">Loading login...</p>}>
        <PortalLoginForm
          role="user"
          title="Welcome back"
          subtitle="Sign in to manage your bookings, wishlist, and travel profile."
          showThemeToggle={false}
          showGoogleSignIn
          embedded
        />
      </Suspense>
      {message ? <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}
      <p className="mt-8 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={() => setMode("register")} className="font-semibold text-primary hover:underline">
          Create account
        </button>
      </p>
    </div>
  );
}

export default function CustomerLoginView() {
  return <CustomerLoginContent />;
}
