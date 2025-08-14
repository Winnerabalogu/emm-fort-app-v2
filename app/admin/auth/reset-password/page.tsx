// app/admin/auth/reset-password/page.tsx
import AdminAuthLayout from '@/components/admin/auth/AdminAuthLayout';
import AdminResetPasswordForm from '@/components/admin/auth/AdminResetPasswordForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function AdminResetPasswordPage() {
  const session = await auth();
  
  // If already logged in as admin, redirect to admin dashboard
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin/overview');
  }

  return (
    <AdminAuthLayout>
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <AdminResetPasswordForm />
      </Suspense>
    </AdminAuthLayout>
  );
}