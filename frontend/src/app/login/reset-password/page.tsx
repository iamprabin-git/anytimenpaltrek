import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function UserResetPasswordPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Loading...</p>}>
      <ResetPasswordForm role="user" />
    </Suspense>
  );
}
