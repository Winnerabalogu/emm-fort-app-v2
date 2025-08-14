// app/admin/auth/login/page.tsx
import AdminAuthLayout from '@/components/admin/auth/AdminAuthLayout';
import AdminLoginForm from '@/components/admin/auth/AdminLoginForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLoginPage() {
  const session = await auth();
  
  // If already logged in as admin, redirect to admin dashboard
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin/overview');
  }

  // If logged in but not admin, show them they need admin access
  if (session?.user && session.user.role !== 'ADMIN') {
    redirect('/dashboard'); // Or show access denied page
  }

  return (
    <AdminAuthLayout>
      <AdminLoginForm />
    </AdminAuthLayout>
  );
}