"use client";

import { Tier } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModalPayload = {
  tierName?: string;
  email?: string;
  currentTier?: Tier; 
  paidDownlines?: number; 
  downlineId?: string;
  balance?: number; 
};

type ModalType = 'TIER_OVERVIEW' | 'UPGRADE_TIER' | 'PAYMENT' | 'ADD_DOWNLINE'| 'DOWNLINE_OVERVIEW'| 'ADD_DOWNLINE'| 'WITHDRAWAL'| 'SAVE';

interface ModalContextType {
  isOpen: boolean;
  modalType: ModalType | null;
  payload: ModalPayload | null;
  openModal: (type: ModalType, payload?: ModalPayload) => void;
  closeModal: () => void;
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