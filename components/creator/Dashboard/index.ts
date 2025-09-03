// Main component export
export { default as CreatorDashboard } from '@/components/creator/Dashboard/CreatorDashboard';

// Individual component exports
export { default as Sidebar } from '@/components/creator/Dashboard/sidebar';
export { default as Header } from '@/components/creator/Dashboard/Header';
export { default as StatCard } from '@/components/creator/Dashboard/StatCard';
export { default as StatsGrid } from '@/components/creator/Dashboard/StatsGrid';
export { default as QuickActions } from '@/components/creator/Dashboard/QuickActions';
export { default as ActivityItem } from '@/components/creator/Dashboard/ActivityItem';
export { default as RecentActivity } from '@/components/creator/Dashboard/RecentActivity';

// Type exports
export type {
  User,
  SidebarLink,
  Activity,
  StatCardProps,
  SidebarProps,
  HeaderProps,
  StatsGridProps,
  QuickActionsProps,
  ActivityItemProps,
  RecentActivityProps
} from '@/types/Creatortypes/dashboard';

// Utility exports
export {
  formatCurrency,
  copyToClipboard,
  formatNumber,
  calculatePercentageChange,
  formatTimeAgo,
  validateReferralCode,
  generateShareableUrl,
  isMobile,
  truncateText
} from '@//utils/helpers';