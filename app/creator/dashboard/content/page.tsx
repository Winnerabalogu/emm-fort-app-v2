// app/creator/dashboard/content/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { CreatorContentHub } from '@/components/creator/Dashboard/content';

export const metadata: Metadata = {
  title: 'Content Hub',
  description: 'Manage your content templates, posts, and scheduling',
};

export default function ContentHubPage() {
  return <CreatorContentHub />;
}