
import { Tier } from '@prisma/client';

export const tiersData = [
  { 
    name: 'Basic', 
    price: 'Free', 
    features: ['1% Primary Commission', 'Access to basic dashboard'], 
    registration: 'Annually',
    primaryCommission: '1%',
    secondaryCommission: 'None',
    isRecommended: false
    
  },
  { 
    name: 'Bronze', 
    price: '₦10,000', 
    features: ['2% Primary Commission', 'Foodstuffs Bonus on target'], 
    registration: 'Annually',
    primaryCommission: '2%',
    secondaryCommission: 'None',
    isRecommended: false
  },
  { 
    name: 'Silver', 
    price: '₦25,000', 
    features: ['4% Primary Commission', '1% Secondary Commission', 'Foodstuffs Bonus on target'], 
    registration: 'Annually',
    primaryCommission: '4%',
    secondaryCommission: '1%',
    isRecommended: false
  },
  { 
    name: 'Gold', 
    price: '₦50,000', 
    features: ['5% Primary Commission', '1% Secondary Commission', 'Foodstuffs & Kitchen Essentials'], 
    registration: 'Annually',
    primaryCommission: '5%',
    secondaryCommission: '1%',
    isRecommended: true
  },
  { 
    name: 'Platinum', 
    price: '₦100,000', 
    features: ['6% Primary Commission', '2% Secondary Commission', 'Foodstuffs & Kitchen Essentials'], 
    registration: 'Annually',
    primaryCommission: '6%',
    secondaryCommission: '2%',
    isRecommended: false
  },
];
export const tierPrices: { [key: string]: number } = {
  'BASIC': 0,
  'BRONZE': 10000,
  'SILVER': 25000,
  'GOLD': 50000,
  'PLATINUM': 100000,
};

export const upgradeRequirements: Record<string, Record<string, { fee: string, downlines: number }>> = {
  'BASIC': {
    'BRONZE':   { fee: '₦10,000', downlines: 5 },
    'SILVER':   { fee: '₦25,000', downlines: 10 },
    'GOLD':     { fee: '₦50,000', downlines: 20 },
    'PLATINUM': { fee: '₦100,000', downlines: 50 },
  },
  'BRONZE': {
    'SILVER':   { fee: '₦15,000', downlines: 5 },
    'GOLD':     { fee: '₦40,000', downlines: 15 },
    'PLATINUM': { fee: '₦90,000', downlines: 40 },
  },
  'SILVER': {
    'GOLD':     { fee: '₦25,000', downlines: 10 },
    'PLATINUM': { fee: '₦75,000', downlines: 30 },
  },
  'GOLD': {
    'PLATINUM': { fee: '₦50,000', downlines: 10 },
  }
};

export const upgradeFees: Record<Tier, Partial<Record<Tier, number>>> = {
  BASIC: {
    BRONZE: 10000,
    SILVER: 25000,
    GOLD: 50000,
    PLATINUM: 100000,
  },
  BRONZE: {
    SILVER: 15000,
    GOLD: 40000,
    PLATINUM: 90000,
  },
  SILVER: {
    GOLD: 25000,
    PLATINUM: 75000,
  },
  GOLD: {
    PLATINUM: 50000,
  },
  PLATINUM: {},
};

export const tierMonthlyTargets: Record<Tier, number> = {
  BASIC: 50000,
  BRONZE: 150000,
  SILVER: 300000,
  GOLD: 750000,
  PLATINUM: 1500000,
};
export const tierQuarterlyTargets: { [key: string]: number } = {
  'BASIC': 1000000,
  'BRONZE': 2000000,
  'SILVER': 3000000,
  'GOLD': 5000000,
  'PLATINUM': 7500000,
};

export const commissionRates: Record<Tier, { primary: number; secondary: number }> = {
  BASIC:    { primary: 0.01, secondary: 0 },       // 1%
  BRONZE:   { primary: 0.02, secondary: 0 },       // 2%
  SILVER:   { primary: 0.04, secondary: 0.01 },    // 4% and 1%
  GOLD:     { primary: 0.05, secondary: 0.01 },    // 5% and 1%
  PLATINUM: { primary: 0.06, secondary: 0.02 },    // 6% and 2%
};