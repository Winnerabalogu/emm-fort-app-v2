"use client"
import React, { useState } from 'react';
import { Download, CreditCard, AlertCircle } from 'lucide-react';
import { PayoutInfoCardProps } from '@/types/Creatortypes/earnings';

const PayoutInfoCard: React.FC<PayoutInfoCardProps> = ({ 
  payoutInfo, 
  onViewSettings, 
  onRequestWithdrawal,
  availableBalance = 0 
}) => {
  const [showWithdrawalForm, setShowWithdrawalForm] = useState<boolean>(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalNote, setWithdrawalNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const formatCurrency = (amount: number): string => 
    `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleWithdrawalSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!onRequestWithdrawal) return;

    const amount = parseFloat(withdrawalAmount);
    
    if (isNaN(amount) || amount < 100) {
      alert('Minimum withdrawal amount is ₦100');
      return;
    }

    if (amount > availableBalance) {
      alert(`Insufficient balance. Available: ${formatCurrency(availableBalance)}`);
      return;
    }

    try {
      setIsProcessing(true);
      await onRequestWithdrawal(amount, withdrawalNote || undefined);
      
      // Reset form on success
      setWithdrawalAmount('');
      setWithdrawalNote('');
      setShowWithdrawalForm(false);
    } catch (error) {
      console.error('Withdrawal request failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canRequestWithdrawal = availableBalance >= 100;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-500 rounded-lg">
          <Download className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payout Information</h3>
          
          {/* Available Balance */}
          <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(availableBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Next Auto Payout</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(payoutInfo.nextPayoutAmount)}</p>
                <p className="text-xs text-gray-500">{payoutInfo.nextPayoutDate}</p>
              </div>
            </div>
          </div>

          {/* Payout Info */}
          <p className="text-gray-600 mb-4">
            Automatic payouts occur {payoutInfo.payoutFrequency} and typically reach your account within {payoutInfo.processingDays}.
            You can also request withdrawals manually when your balance is ₦100 or more.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onViewSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Payout Settings
            </button>
            
            {onRequestWithdrawal && (
              <button 
                onClick={() => setShowWithdrawalForm(!showWithdrawalForm)}
                disabled={!canRequestWithdrawal}
                className={`font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  canRequestWithdrawal
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="h-4 w-4" />
                Request Withdrawal
              </button>
            )}
          </div>

          {/* Minimum Balance Warning */}
          {!canRequestWithdrawal && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Minimum withdrawal amount is ₦100</span>
            </div>
          )}

          {/* Withdrawal Form */}
          {showWithdrawalForm && onRequestWithdrawal && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Request Withdrawal</h4>
              <form onSubmit={handleWithdrawalSubmit} className="space-y-3">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₦)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    min="100"
                    max={availableBalance}
                    step="0.01"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder={`Min: ₦100, Max: ₦${availableBalance.toFixed(2)}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isProcessing}
                  />
                </div>
                
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                    Note (Optional)
                  </label>
                  <input
                    id="note"
                    type="text"
                    value={withdrawalNote}
                    onChange={(e) => setWithdrawalNote(e.target.value)}
                    placeholder="Reason for withdrawal..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isProcessing}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isProcessing || !withdrawalAmount}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdrawalForm(false);
                      setWithdrawalAmount('');
                      setWithdrawalNote('');
                    }}
                    disabled={isProcessing}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayoutInfoCard;