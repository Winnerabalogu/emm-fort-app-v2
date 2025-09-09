
"use client";
import Providers from '../app/providers';
import { ModalProvider } from '@/contexts/ModalContext';
import ModalManager from '@/components/modals/ModalManager';
import { Suspense, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import '@/styles/globals.css';
import Preloader from '@/components/Preloader';
import { MouseTracker } from './ui/Tilt';

export default function ClientLayout({ children }: { children: React.ReactNode }) {  
  const [isLoading, setIsLoading] = useState(true);
  const [finishLoading, setFinishLoading] = useState(false);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setFinishLoading(true); 
      
      
      setTimeout(() => {
        setIsLoading(false);
      }, 700); 
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

 return (
  <Providers>
    <ModalProvider>        
      <Suspense fallback={null}>
        {isLoading && (
          <Preloader 
            finishLoading={finishLoading}
            delay={500}           
            fadeDuration={200}    
            color1="#000"         
            color2="#ccc"         
          />
        )}
      </Suspense>     

      {/* Global Cursor */}
      <MouseTracker 
        enabled={true}         
        cursorSize={10} 
        followerSize={40} 
        cursorColor="#000" 
        followerColor="rgba(0, 0, 0, 0.42)" 
        hoverElements="a, button, [data-hover]" 
        minWidth={768} 
      />

      {children}       
      <Toaster /> 
      <ModalManager />
    </ModalProvider>
  </Providers>
);

}