import { Suspense } from "react";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { PortalAuthCardShell } from "@/components/PortalLoginShell";

export default function AdminForgotPasswordPage() {
  return (
    <PortalAuthCardShell>
      <Suspense fallback={<p className="text-center text-muted">Loading...</p>}>
        <ForgotPasswordForm
          role="admin"
          subtitle="Enter your admin account email to receive a reset link."
          defaultEmail="admin@anytimenepaltrek.com"
          embedded
        />
      </Suspense>
    </PortalAuthCardShell>
  );
}
