import { Suspense } from "react";
import PortalLoginForm from "@/components/PortalLoginForm";
import PortalLoginShell from "@/components/PortalLoginShell";
import { PORTAL_LOGIN_IMAGES } from "@/lib/media";

export default function AgentLoginPage() {
  return (
    <PortalLoginShell
      portalLabel="Agent Portal"
      imageTagline="Adventure starts here."
      imageSubline="Handle bookings, treks, tours, and guest requests in one place."
      image={PORTAL_LOGIN_IMAGES.agent}
      imageAlt="Himalayan trekking and outdoor adventure lifestyle"
    >
      <Suspense fallback={<p className="text-center text-muted">Loading login...</p>}>
        <PortalLoginForm
          role="agent"
          title="Welcome back"
          subtitle="Sign in to your agent account to manage daily operations."
          defaultEmail="agent@anytimenepaltrek.com"
          showThemeToggle={false}
          showGoogleSignIn={false}
          embedded
        />
      </Suspense>
    </PortalLoginShell>
  );
}
