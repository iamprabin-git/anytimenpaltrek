import { Suspense } from "react";
import PortalLoginForm from "@/components/PortalLoginForm";
import PortalLoginShell from "@/components/PortalLoginShell";
import { PORTAL_LOGIN_IMAGES } from "@/lib/media";

export default function AdminLoginPage() {
  return (
    <PortalLoginShell
      portalLabel="Admin Portal"
      imageTagline="Curate unforgettable journeys."
      imageSubline="Manage your brand, content, and team from one beautiful workspace."
      image={PORTAL_LOGIN_IMAGES.admin}
      imageAlt="Travel planning and curated adventure experiences"
    >
      <Suspense fallback={<p className="text-center text-muted">Loading login...</p>}>
        <PortalLoginForm
          role="admin"
          title="Welcome back"
          subtitle="Sign in to your admin account to manage the store."
          defaultEmail="admin@anytimenepaltrek.com"
          showThemeToggle={false}
          showGoogleSignIn={false}
          embedded
        />
      </Suspense>
    </PortalLoginShell>
  );
}
