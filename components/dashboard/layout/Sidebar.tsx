"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Receipt, Target,
  Users, DollarSign, Settings, LogOut, Share2
} from 'lucide-react';
import Image from 'next/image';
import { signOut } from 'next-auth/react'; 

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobile?: boolean;
}

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tier', href: '/dashboard/tier', icon: Package },
  { name: 'Transaction', href: '/dashboard/transactions', icon: Receipt },
  { name: 'Monthly target', href: '/dashboard/targets', icon: Target },
  { name: 'Total earned', href: '/dashboard/earnings', icon: DollarSign },
  { name: 'Downlines', href: '/dashboard/downlines', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Referrals', href: '/dashboard/referrals', icon: Share2 },
];

const Sidebar = ({ isSidebarOpen, isMobile = false }: SidebarProps) => {
  const pathname = usePathname();
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <aside className={`flex flex-col bg-ui-surface transition-all duration-300 ease-in-out border-r border-ui-border ${isSidebarOpen ? 'w-64' : 'w-20'} ${isMobile ? 'h-full' : ''}`}>
      <div className={`flex items-center gap-2 p-4 border-b border-ui-border ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
        <Image src="/logos/og-logo.png" alt="Logo" width={40} height={40} />
        <span className={`font-bold text-xl text-text-primary ${!isSidebarOpen && 'hidden'}`}>
            <span className="text-brand-orange">EM</span>M-Fort
        </span>
      </div>

      <nav className="flex-grow pt-4">
        <ul>
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name} className="px-4 py-1">
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${isActive ? 'bg-orange-500 text-white' : 'text-text-secondary hover:bg-brand-light hover:text-white'}
                    ${!isSidebarOpen && 'justify-center'}
                  `}
                >
                  <link.icon className="h-5 w-5 shrink-0" />
                  <span className={`${!isSidebarOpen && 'hidden'}`}>{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-ui-border">
         <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-text-secondary hover:bg-red-500 hover:text-white transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={`${!isSidebarOpen && 'hidden'}`}>Sign out</span>
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;