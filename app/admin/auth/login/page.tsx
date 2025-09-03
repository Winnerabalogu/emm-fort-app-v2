// app/admin/auth/login/page.tsx
import AdminAuthLayout from '@/components/admin/auth/AdminAuthLayout';
import AdminLoginForm from '@/components/admin/auth/AdminLoginForm';

export default async function AdminLoginPage() {
  
  return (
    <AdminAuthLayout>
      <AdminLoginForm />
    </AdminAuthLayout>
  );
}