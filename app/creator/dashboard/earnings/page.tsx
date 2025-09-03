// app/creator/dashboard/content/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { CreatorEarningsDashboard } from '@/components/creator/Dashboard/earnings';

export const metadata: Metadata = {
  title: 'Content Hub',
  description: 'Manage your content templates, posts, and scheduling',
};

export default function EarningPage() {
  return <CreatorEarningsDashboard />;
}