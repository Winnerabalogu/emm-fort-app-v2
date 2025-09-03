// lib/types.ts
import { Tier as PrismaTier, Role } from '@prisma/client';

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

export type CachedUserData = {
  id: string;
  fullName: string;
  email?: string;
  username: string;
  tier: Tier;
  emailVerified: Date | null;
  subscriptionStartDate: Date | null;
  image?: string | null;
  role: Role; 
    isCreator: boolean;
  instagramHandle?: string;
  tiktokHandle?: string;
  whatsappNumber?: string;
  contentStyle?: string;
  followersCount?: string;
}
export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  tier: string;
  isVerified: boolean;
  subscriptionStartDate: string | null;
  subscriptionExpiryDate: string | null;
  createdAt: string;
  totalCommissions: number;
  directReferrals: number;
}
export interface SaveRequest {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    tier: string;
  };
}
export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    tier: string;
    withdrawalDetails: {
      bankName: string;
      firstName: string;
      lastName: string;
      accountNumber: string;
    } | null;
  };
}