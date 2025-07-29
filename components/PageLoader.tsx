"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import '@/styles/nprogress.css'; 

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {   
    NProgress.start();    
    return () => {
      NProgress.done();
    };
  }, [pathname, searchParams]);
  return null;
}