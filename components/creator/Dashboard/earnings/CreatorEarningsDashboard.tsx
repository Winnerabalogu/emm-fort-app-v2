/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useState, useEffect } from 'react';

// Component imports
import EarningsHeader from './EarningsHeader';
import EarningsSummaryGrid from './EarningsSummaryGrid';
import ChartsGrid from './ChartsGrid';
import TransactionTable from './TransactionTable';
import PayoutInfoCard from './PayoutInfoCard';

// Type imports
import { 
  TimeRange, 
  TransactionFilter, 
  DailyEarningsData, 
  Transaction, 
  EarningsSummary,
  PayoutInfo 
} from '@/types/Creatortypes/earnings';

// API response types
interface APIResponse {
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
}

const CreatorEarningsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [filterType, setFilterType] = useState<TransactionFilter>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // API data state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [earningsData, setEarningsData] = useState<DailyEarningsData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    thisWeekEarnings: 0,
    pendingEarnings: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    monthlyGrowth: 0
  });
  const [payoutInfo, setPayoutInfo] = useState<PayoutInfo>({
    nextPayoutAmount: 0,
    nextPayoutDate: 'TBD',
    payoutFrequency: 'bi-weekly',
    processingDays: '2-3 business days'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch earnings data from API
  const fetchEarningsData = async (
    newTimeRange?: TimeRange, 
    newFilterType?: TransactionFilter, 
    page?: number
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeRange: newTimeRange || timeRange,
        filterType: newFilterType || filterType,
        page: (page || currentPage).toString(),
        limit: '5'
      });

      const response = await fetch(`/api/creator/earnings?${params}`);
      const result: APIResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch earnings data');
      }

      if (result.success && result.data) {
        setEarningsSummary(result.data.summary);
        setEarningsData(result.data.chartData.data);
        setTransactions(result.data.transactions.data);
        setPayoutInfo(result.data.payoutInfo);
        setPagination(result.data.transactions.pagination);
      }
    } catch (err) {
      console.error('Error fetching earnings data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load earnings data');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchEarningsData();
  }, []);

  // Event handlers
  const handleTimeRangeChange = async (range: TimeRange): Promise<void> => {
    setTimeRange(range);
    await fetchEarningsData(range, filterType, 1);
    setCurrentPage(1);
  };

  const handleFilterChange = async (filter: TransactionFilter): Promise<void> => {
    setFilterType(filter);
    setCurrentPage(1);
    await fetchEarningsData(timeRange, filter, 1);
  };

  const handlePageChange = async (page: number): Promise<void> => {
    setCurrentPage(page);
    await fetchEarningsData(timeRange, filterType, page);
  };

  const handleExport = async (): Promise<void> => {
    try {      
      const params = new URLSearchParams({
        timeRange,
        filterType,
        limit: '1000'
      });

      const response = await fetch(`/api/creator/earnings?${params}`);
      const result: APIResponse = await response.json();

      if (result.success && result.data) {
        // Create CSV content
        const csvContent = [
          ['Date', 'Type', 'Amount', 'Customer', 'Status', 'Description'].join(','),
          ...result.data.transactions.data.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.type,
            tx.amount.toString(),
            tx.customer,
            tx.status,
            `Order Value: ₦${tx.orderValue}`
          ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `earnings-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export transactions. Please try again.');
    }
  };

  const handleViewPayoutSettings = (): void => {
    // Navigate to payout settings page
    window.location.href = '/creator/settings/payout';
  };

  const handleWithdrawalRequest = async (amount: number, note?: string): Promise<void> => {
    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, note })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Withdrawal request submitted successfully! Amount: ₦${amount}`);        
        await fetchEarningsData();
      } else {
        alert(result.error || 'Withdrawal request failed');
      }
    } catch (err) {
      console.error('Withdrawal request failed:', err);
      alert('Failed to submit withdrawal request. Please try again.');
    }
  };

  // Loading state
  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Earnings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchEarningsData()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <EarningsHeader totalEarnings={earningsSummary.totalEarnings} />

      {/* Earnings Summary Cards */}
      <EarningsSummaryGrid summary={earningsSummary} />

      {/* Charts Section */}
      <ChartsGrid 
        data={earningsData}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />

      {/* Transactions Table */}
      <TransactionTable 
        transactions={transactions}
        filterType={filterType}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        totalTransactions={pagination.totalCount}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      {/* Payout Information */}
      <PayoutInfoCard 
        payoutInfo={payoutInfo}
        onViewSettings={handleViewPayoutSettings}
        onRequestWithdrawal={handleWithdrawalRequest}
        availableBalance={earningsSummary.totalEarnings - payoutInfo.nextPayoutAmount}
      />
    </div>
  );
};

export default CreatorEarningsDashboard;