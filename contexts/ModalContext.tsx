"use client";

import { Tier } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SaveRequest } from '@/lib/types';
import {User} from '@/lib/types';
import { WithdrawalRequest } from '@/lib/types';

type ModalPayload = {
  tierName?: string;
  email?: string;
  currentTier?: Tier; 
  paidDownlines?: number; 
  downlineId?: string;
  balance?: number; 
  component?: ReactNode;
  transaction?: Transaction;
  user?: User;
   onEdit?: (user: User) => void;
   withdrawal?: WithdrawalRequest;
  onSuccess?: () => void;   
   saveRequest?: SaveRequest;
};
interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    tier: string;
  };
  sourceUser?: {
    id: string;
    fullName: string;
    username: string;
    tier: string;
  };
}
type ModalType = 'TIER_OVERVIEW' | 'UPGRADE_TIER' | 'PAYMENT' | 'ADD_DOWNLINE'| 'DOWNLINE_OVERVIEW'| 'ADD_DOWNLINE'| 'WITHDRAWAL'| 'SAVE'|'CREATE_TRANSACTION' | 'VIEW_TRANSACTION' | 'EDIT_TRANSACTION' | 'CREATE_USER' | 'VIEW_USER' | 'EDIT_USER' | 'VIEW_WITHDRAWAL'| 'CREATE_COMMISSION' | 'VIEW_SAVE_REQUEST';

interface ModalContextType {
  isOpen: boolean;
  modalType: ModalType | null;
  payload: ModalPayload | null;
  openModal: (type: ModalType, payload?: ModalPayload) => void;
  closeModal: () => void;    
  onSuccess?: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [payload, setPayload] = useState<ModalPayload | null>(null);

  const openModal = (type: ModalType, payload: ModalPayload = {}) => {
    setModalType(type);
    setPayload(payload);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);    
    setTimeout(() => {
      setModalType(null);
      setPayload(null);
    }, 300); 
  };

  return (
    <ModalContext.Provider value={{ isOpen, modalType, payload, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};