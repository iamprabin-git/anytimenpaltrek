import { Suspense } from "react";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function UserForgotPasswordPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Loading...</p>}>
      <ForgotPasswordForm role="user" subtitle="Enter your customer account email to receive a reset link." />
    </Suspense>
  );
}
