import ResetPasswordForm from "@/components/auth/reset-password";
import { Suspense } from "react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
    </AuthLayout>
  );
}