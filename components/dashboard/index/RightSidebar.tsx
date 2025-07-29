"use client";

import { Wallet, Plus, Users, Receipt, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Button from "@/components/ui/Button"; 
import EmptyState from "@/components/ui/EmptyState"; 
import { Downline, Transaction } from "@/lib/types";
import { formatNaira } from '@/lib/utils/formatCurrency';
import { useModal } from '@/contexts/ModalContext';
import Link from 'next/link';

interface RightSidebarProps {
  totalEarned: number;
  quarterlyTarget: number;
  downlines: Downline[];
  transactions: Transaction[];
}

const isDebitTransaction = (type: string) => {
  const debitTypes = ['WITHDRAWAL', 'SUBSCRIPTION_FEE', 'UPGRADE_FEE'];
  return debitTypes.includes(type.toUpperCase());
};

const RightSidebar = ({ totalEarned, quarterlyTarget, downlines, transactions }: RightSidebarProps) => {
   const { openModal } = useModal();

  const circumference = 2 * Math.PI * 54;
  const progress = quarterlyTarget > 0 ? Math.min((totalEarned / quarterlyTarget), 1) : 0;
  const strokeDashoffset = circumference - progress * circumference;
   const handleAddDownlineClick = () => {
        openModal('ADD_DOWNLINE'); 
    };

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:space-y-8">
      {/* Total Earned Card */}
      <div className="p-6 rounded-2xl bg-white shadow-soft text-center">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-text-primary">Total Earned</h3>
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Wallet className="h-5 w-5" /></div>
        </div>
        <div className="my-4 flex justify-center">
          <div className="relative h-40 w-40">
            <svg className="transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e9ecef" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="54" fill="none" stroke="#ff4500"
                strokeWidth="12" strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold text-md text-text-primary">{formatNaira(totalEarned)}</span>
              <span className="text-xs text-text-secondary mt-1">of {formatNaira(quarterlyTarget)}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-text-secondary">Quarterly Target Progress</p>
      </div>

      {/* Downlines Card */}
      <div className="p-6 rounded-2xl bg-white shadow-soft">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-text-primary">Downlines</h3>
          <p className="text-sm text-orange-600 font-medium">Benefits</p>
        </div>
        {downlines && downlines.length > 0 ? (
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {downlines.map(d => (
              <div key={d.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-gray-800">{d.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{d.tier.toLowerCase()}</p>
                </div>
                <p className="font-semibold text-sm text-green-600">+{formatNaira(d.benefit)}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState Icon={Users} message="No Downlines Yet" description="Add downlines to start earning referral benefits." />
        )}
        <div className="mt-6 flex justify-between items-center">
          <Button onClick={handleAddDownlineClick} className="!w-auto !py-2 !px-4 text-sm flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Add Downline
          </Button>
          {downlines && downlines.length > 0 && (
            <Link href="/dashboard/downlines" className="text-sm font-semibold text-orange-600 hover:underline">See All</Link>
          )}
        </div>
      </div>

      {/* Recent Transactions Card */}
      <div className="p-6 rounded-2xl bg-white shadow-soft">
        <h3 className="font-semibold text-text-primary mb-4">Recent Transactions</h3>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map(t => {
              const isDebit = isDebitTransaction(t.type);
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isDebit ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {isDebit ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800 capitalize">{t.type.replace(/_/g, ' ').toLowerCase()}</p>
                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                  <p className={`ml-auto font-semibold text-sm ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                    {isDebit ? '-' : '+'}{formatNaira(t.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState Icon={Receipt} message="No Transactions" description="Your recent transactions will appear here." />
        )}        
        {transactions && transactions.length > 0 && (
          <div className="text-center mt-6">
            <Link href="/dashboard/transactions" className="text-sm font-semibold text-orange-600 hover:underline">
              View All Transactions
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;