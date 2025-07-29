// components/ClientLayout.tsx
"use client";
import Providers from '../app/providers';
import { ModalProvider } from '@/contexts/ModalContext';
import ModalManager from '@/components/modals/ModalManager';
import { Suspense } from 'react';
import PageLoader from './PageLoader'; 
import '@/styles/globals.css';

export default function ClientLayout({ children }: { children: React.ReactNode }) {  
  return (
     <Providers>
      <ModalProvider>        
        <Suspense fallback={null}>
            <PageLoader />
        </Suspense>        
        {children}        
        <ModalManager />
      </ModalProvider>
    </Providers>
  );
}