import { LucideIcon } from 'lucide-react';

// User interface
export interface User {
  name: string;
  handle: string;
  avatar: string;
  referralCode: string;
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingPayment: number;
  totalReferrals: number;
  contentPosts: number;
}

// Navigation link interface
export interface SidebarLink {
  name: string;
  href: string;
  icon: LucideIcon;
  current?: boolean;
}

// Activity interface
export interface Activity {
 type: 'earning' | 'withdrawal' | 'content'| 'referral'|'withdrawal';
  message: string;
  amount?: number | null;
  time: string;
  createdAt?: string;
  description: string;
  timestamp: string;
}

// Stat card interface
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  subtitle?: string;
  subtitleColor?: string;
}

// Component props interfaces
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  sidebarLinks: SidebarLink[];
}

export interface HeaderProps {
  onMenuClick: () => void;
  user: User;
}

export interface StatsGridProps {
  user: User;
  stats: DashboardStats;
  dailyEarnings: DailyEarning[];
}

export interface QuickActionsProps {
  user: User;
  onRefresh?: () => void;
}

export interface ActivityItemProps {
  activity?: Activity;
  recentactivity:RecentActivities
}

export interface RecentActivityProps {
  activities?: Activity[];
  transactions?:RecentTransaction[]
   isLoading?: boolean;
}

export interface DashboardStats {
  totalEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  pendingEarnings: number;
  earningsGrowth: number;
  totalReferrals: number;
  thisWeekReferrals: number;
  totalContentPosts: number;
  thisWeekContentPosts: number;
  affiliateEarnings?: number
  affiliateCommissionCount?: number
  creatorEarnings?: number
  creatorCommissionCount?: number
}

export interface DailyEarning {
  date: string;
  earnings: number;
}

export interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

export interface RecentActivities {
  type: 'earning' | 'withdrawal' | 'content'| 'referral'|'withdrawal';
  message: string;
  amount: string;
  time: string;
  createdAt?: string;
}

export interface DashboardData {
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    phone?: string;
    instagramHandle?: string;
    tiktokHandle?: string;
    whatsappNumber?: string;
    referralCode: string;
    isCreator: boolean;
    joinDate: string;
  };
  stats: DashboardStats;
  dailyEarnings: DailyEarning[];
  recentTransactions: RecentTransaction[];
  recentActivity: Activity[];
}