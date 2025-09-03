import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Creator Hub - EMM-Fort',
    default: 'Creator Hub - EMM-Fort',
  },
  description: 'Creator dashboard for managing content, earnings, and analytics',
};

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}