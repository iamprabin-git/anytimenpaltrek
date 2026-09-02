import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { PortalAuthCardShell } from "@/components/PortalLoginShell";

export default function AgentResetPasswordPage() {
  return (
    <PortalAuthCardShell>
      <Suspense fallback={<p className="text-center text-muted">Loading...</p>}>
        <ResetPasswordForm role="agent" embedded />
      </Suspense>
    </PortalAuthCardShell>
  );
}
