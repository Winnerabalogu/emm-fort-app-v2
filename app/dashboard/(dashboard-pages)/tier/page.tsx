import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TierClient from '@/components/dashboard/tier/TierClient'; 

export default async function TierPageServer() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return <TierClient session={session} />;
}
