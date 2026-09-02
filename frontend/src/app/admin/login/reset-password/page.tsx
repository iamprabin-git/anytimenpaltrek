import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { PortalAuthCardShell } from "@/components/PortalLoginShell";

export default function AdminResetPasswordPage() {
  return (
    <PortalAuthCardShell>
      <Suspense fallback={<p className="text-center text-muted">Loading...</p>}>
        <ResetPasswordForm role="admin" embedded />
      </Suspense>
    </PortalAuthCardShell>
  );
}
