import CustomerLoginView from "@/components/CustomerLoginView";
import PortalLoginShell from "@/components/PortalLoginShell";
import { PORTAL_LOGIN_IMAGES } from "@/lib/media";

export default function LoginPage() {
  return (
    <PortalLoginShell
      portalLabel="Customer Account"
      imageTagline="Your next adventure awaits."
      imageSubline="Sign in to track treks, manage bookings, and plan your Himalayan journey with ease."
      image={PORTAL_LOGIN_IMAGES.customer}
      imageAlt="Himalayan trekking and travel adventure lifestyle"
    >
      <CustomerLoginView />
    </PortalLoginShell>
  );
}
