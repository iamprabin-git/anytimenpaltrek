import { Suspense } from "react";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { PortalAuthCardShell } from "@/components/PortalLoginShell";

export default function AgentForgotPasswordPage() {
  return (
    <PortalAuthCardShell>
      <Suspense fallback={<p className="text-center text-muted">Loading...</p>}>
        <ForgotPasswordForm
          role="agent"
          subtitle="Enter your agent account email to receive a reset link."
          defaultEmail="agent@anytimenepaltrek.com"
          embedded
        />
      </Suspense>
    </PortalAuthCardShell>
  );
}
