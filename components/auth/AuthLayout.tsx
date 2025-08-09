"use client"

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (    
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 lg:p-8">
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Go Back</span>
      </Link>           
      
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-2xl lg:rounded-3xl shadow-2xl p-8 lg:p-12">
        {children}
      </div>
    </div>    
  );
}