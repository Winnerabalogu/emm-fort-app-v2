import { LucideIcon } from 'lucide-react';

// Earnings data interfaces
export interface DailyEarningsData {
  date: string;
  earnings: number;
  orders: number;
  referrals: number;
}

export interface Transaction {
  id: number;
  type: 'commission' | 'withdrawal';
  amount: number;
  customer: string;
  orderValue: number;
  date: string;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  referralCode: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  thisWeekEarnings: number;
  pendingEarnings: number;
  averageOrderValue: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyGrowth: number;
}

export interface PayoutInfo {
  nextPayoutAmount: number;
  nextPayoutDate: string;
  payoutFrequency: string;
  processingDays: string;
}

// Filter and time range types
export type TimeRange = '7days' | '30days' | '90days' | '365days';
export type TransactionFilter = 'all' | 'commission' | 'withdrawal';
export type TransactionStatus = 'completed' | 'processing' | 'pending' | 'failed';

// Component props interfaces
export interface EarningsHeaderProps {
  totalEarnings: number;
}

export interface EarningsSummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  subtitle: string;
  subtitleIcon: LucideIcon;
  subtitleColor: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface EarningsSummaryGridProps {
  summary: EarningsSummary;
}

export interface EarningsChartProps {
  data: DailyEarningsData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export interface OrdersChartProps {
  data: DailyEarningsData[];
}

export interface TransactionTableProps {
  transactions: Transaction[];
  filterType: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
  onExport: () => void;
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export interface TransactionRowProps {
  transaction: Transaction;
}

export interface StatusBadgeProps {
  status: TransactionStatus;
}

export interface PayoutInfoCardProps {
  payoutInfo: PayoutInfo;
  onViewSettings: () => void;
  onRequestWithdrawal?: (amount: number, note?: string) => Promise<void>;
  availableBalance?: number;
}

export interface ChartsGridProps {
  data: DailyEarningsData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

// API Response Types
export interface APIResponse {
  success: boolean;
  data?: {
    summary: EarningsSummary;
    chartData: {
      timeRange: string;
      data: DailyEarningsData[];
    };
    transactions: {
      data: Transaction[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
    payoutInfo: PayoutInfo;
    userInfo: {
      referralCode: string;
      hasWithdrawalDetails: boolean;
      canRequestPayout: boolean;
      availableBalance: number;
    };
  };
  error?: string;
  details?: string;
}

// Withdrawal Request Types
export interface WithdrawalRequest {
  amount: number;
  note?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  data?: {
    message: string;
    withdrawalId: string;
    amount: number;
    status: string;
    estimatedProcessing: string;
  };
  error?: string;
}