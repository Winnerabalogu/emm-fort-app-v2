// components/admin/auth/AdminAuthLayout.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

interface AdminAuthLayoutProps {
  children: React.ReactNode;
}

export default function AdminAuthLayout({ children }: AdminAuthLayoutProps) {
  return (    
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-orange-900 flex items-center justify-center p-4 lg:p-8">
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-orange-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Site</span>
      </Link>

      {/* Admin badge */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-1 bg-orange-600/20 border border-orange-500/30 rounded-full text-orange-400 text-xs font-medium">
        <Shield className="w-3 h-3" />
        Admin Portal
      </div>
           
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-2xl lg:rounded-3xl shadow-2xl p-8 lg:p-12">
        {children}
      </div>
    </div>    
  );
}