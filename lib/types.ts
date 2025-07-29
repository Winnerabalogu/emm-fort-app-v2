// lib/types.ts
import { Tier as PrismaTier } from '@prisma/client';

export type Tier = PrismaTier;

export type TransactionType = 'COMMISSION' | 'BONUS' | 'WITHDRAWAL' | 'SAVING' | 'SUBSCRIPTION_FEE' | 'UPGRADE_FEE';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; 
  status: TransactionStatus;
}

export interface Downline {
  id: string;
  name: string;
  tier: Tier;
  benefit: number;
}
export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  tier: Tier;
  subscriptionStartDate: Date | null;
  subscriptionExpiryDate: Date | null;
  
  balance: number;
  totalEarned: number;
  monthlyTarget: {
   target: number;
    history: {
      monthly: { name: string; value: number }[];
      quarterly: { name: string; value: number }[];
      yearly: { name: string; value: number }[];
    };
  };

  transactions: Transaction[];
  downlines: Downline[];
  withdrawalDetails: {
    bankName: string;
    firstName: string;
    lastName: string;
    accountNumber: string;
  } | null;
}