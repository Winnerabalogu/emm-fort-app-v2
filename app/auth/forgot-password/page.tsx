// app/auth/forgot-password/page.tsx
"use client"
import ForgotPasswordForm from "@/components/auth/forgot-password";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {

  return (  
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}