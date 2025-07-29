"use client";

import { useModal } from '@/contexts/ModalContext';
import TierOverviewModal from './TierOverviewModal';
import { AnimatePresence, motion } from 'framer-motion';
import UpgradeTierModal from './UpgradeTierModal';
import DownlineOverviewModal from './DownlineOverviewModal';
import AddDownlineModal from './AddDownlineModal';
import WithdrawalModal from './WithdrawalModal';
import SaveModal from './SaveModal';

const ModalManager = () => {
  const { isOpen, modalType, closeModal } = useModal();

  const renderModal = () => {
    switch (modalType) {
      case 'TIER_OVERVIEW':
        return <TierOverviewModal />;
       case 'UPGRADE_TIER': 
        return <UpgradeTierModal />;
        case 'DOWNLINE_OVERVIEW':
        return <DownlineOverviewModal />;
        case 'ADD_DOWNLINE':
        return <AddDownlineModal />;
        case 'WITHDRAWAL':
      return <WithdrawalModal />;
      case 'SAVE':
        return <SaveModal/>;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal} 
        >
          {/* Stop propagation so clicking inside the modal doesn't close it */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderModal()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalManager;