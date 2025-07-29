"use client"

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({children }: AuthLayoutProps) {

  return (    
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-0 lg:p-8">
            
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-brand-orange transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Go Back</span>
      </Link>           
       <div className="mt-4 max-w-lg h-auto text-black lg:max-w-md lg:h-auto lg:rounded-3xl lg:shadow-2xl flex items-center justify-center p-6 sm:p-12">
        <div className="w-full">
          {children}
        </div>
        </div>
      </div>    
  );
}