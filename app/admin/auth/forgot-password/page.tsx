// app/admin/auth/forgot-password/page.tsx
import AdminAuthLayout from '@/components/admin/auth/AdminAuthLayout';
import AdminForgotPasswordForm from '@/components/admin/auth/AdminForgotPasswordForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminForgotPasswordPage() {
  const session = await auth();
  
  // If already logged in as admin, redirect to admin dashboard
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin/overview');
  }

  return (
    <AdminAuthLayout>
      <AdminForgotPasswordForm />
    </AdminAuthLayout>
  );
}
