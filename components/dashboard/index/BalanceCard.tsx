"use client";
import Button from '@/components/ui/Button';
import { formatNaira } from '@/lib/utils/formatCurrency';
import { useModal } from '@/contexts/ModalContext';

interface BalanceCardProps {
    balance: number;
}

const BalanceCard = ({ balance }: BalanceCardProps) => {
  const { openModal } = useModal();

  const handleWithdrawClick = () => {    
    openModal('WITHDRAWAL', { balance });
  };
  const handleSaveClick = () => {
    openModal('SAVE');
  };
 return (
  <div className="p-6 rounded-2xl bg-ui-surface shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-h-[156px]">
    <div>
      <p className="text-sm text-brand-orange font-semibold">Available Balance</p>
      <p className="text-sm text-text-secondary">My Balance</p>
      <p className="text-3xl font-bold text-text-primary mt-1">
        {formatNaira(balance)}
      </p>
    </div>
    <div className="flex w-full sm:w-auto gap-3 mt-4 sm:mt-0">
      <Button onClick={handleWithdrawClick} className="!w-auto flex-1 !px-6 !bg-rose-900 !hover:bg-indigo-700 !focus:ring-indigo-400">Withdraw</Button>
      <Button onClick={handleSaveClick} className="!w-auto flex-1 !px-6 !bg-indigo-600 !hover:bg-indigo-700 !focus:ring-indigo-400">Save</Button>
    </div>
  </div>
);
};
export default BalanceCard;