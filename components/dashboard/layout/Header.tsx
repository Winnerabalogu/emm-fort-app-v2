// components/dashboard/layout/Header.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, Menu, Search, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);    
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="bg-ui-header/80 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-ui-border">      
      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={toggleSidebar} className="p-2 rounded-full text-text-secondary hover:bg-gray-200/70 hover:text-text-primary transition-colors">
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text-primary">Dashboard</h1>          
          <p className="text-xs sm:text-sm text-text-secondary">{currentDate}</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full sm:w-48 md:w-64 pl-10 pr-4 py-2 text-sm bg-ui-surface border border-ui-border rounded-full focus:ring-2 focus:ring-brand-light focus:border-brand-light transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-full text-text-secondary hover:bg-gray-200/70 hover:text-text-primary transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-full border border-ui-border bg-ui-surface hover:bg-gray-100 transition-colors"
            >
                <Image src="/images/user-avatar.png" alt="User Avatar" width={32} height={32} className="rounded-full" />              
                <span className="text-sm font-semibold text-text-primary hidden md:block">{session?.user?.name || 'User'}</span>
                <ChevronDown className={`h-4 w-4 text-text-secondary hidden md:block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu Panel */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft-lg border border-ui-border py-1 z-40">
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-gray-100 hover:text-text-primary" onClick={() => setIsDropdownOpen(false)}>
                        <Settings className="h-4 w-4" />
                        <span>Profile Settings</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;