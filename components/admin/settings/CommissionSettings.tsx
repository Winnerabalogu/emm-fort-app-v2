// components/admin/settings/CommissionSettings.tsx
import React from 'react';
import { SettingsSectionProps } from '@/types/settings';
import { SaveButton } from './SaveButton';
import { Info } from 'lucide-react';

export function CommissionSettings({ 
  settings, 
  onSettingsChange, 
  onNestedSettingsChange,
  onUpdate, 
  saving 
}: SettingsSectionProps) {
  const handleSave = () => {
    onUpdate('commission', settings.commission);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Withdrawal Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-gray-500">₦</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.commission.minWithdrawalAmount}
              onChange={(e) => onSettingsChange('commission', 'minWithdrawalAmount', parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="5000"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Current: {formatCurrency(settings.commission.minWithdrawalAmount)}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Fee
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-gray-500">₦</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={settings.commission.withdrawalFee}
              onChange={(e) => onSettingsChange('commission', 'withdrawalFee', parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="100"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Current: {formatCurrency(settings.commission.withdrawalFee)}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Days
            <span className="text-xs text-gray-500 ml-1">(1-14)</span>
          </label>
          <input
            type="number"
            min="1"
            max="14"
            value={settings.commission.withdrawalProcessingDays}
            onChange={(e) => onSettingsChange('commission', 'withdrawalProcessingDays', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="3"
          />
          <p className="text-xs text-gray-500 mt-1">
            Business days to process withdrawals
          </p>
        </div>
      </div>

      {/* Commission Rates */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-lg font-medium text-gray-900">Commission Rates by Tier</h4>
          <div className="flex items-center gap-1 text-blue-600">
            <Info className="h-4 w-4" />
            <span className="text-xs">Rates must increase with tier level</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(settings.commission.commissionRates).map(([tier, rate]) => (
            <div key={tier} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {tier.toLowerCase()}
                </label>
                <div className={`w-3 h-3 rounded-full ${
                  tier === 'BRONZE' ? 'bg-amber-600' :
                  tier === 'SILVER' ? 'bg-gray-400' :
                  tier === 'GOLD' ? 'bg-yellow-500' :
                  'bg-purple-600'
                }`}></div>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={rate}
                  onChange={(e) => onNestedSettingsChange('commission', 'commissionRates', tier, parseFloat(e.target.value) || 0)}
                  className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <span className="absolute right-3 top-2.5 text-sm text-gray-500">%</span>
              </div>
              
              <p className="text-xs text-gray-500 mt-1 text-center">
                {rate}% commission
              </p>
            </div>
          ))}
        </div>

        {/* Validation Warning */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Rate Hierarchy</p>
              <p className="text-xs mt-1">
                Bronze &lt; Silver &lt; Gold &lt; Platinum (Current: {settings.commission.commissionRates.BRONZE}% &lt; {settings.commission.commissionRates.SILVER}% &lt; {settings.commission.commissionRates.GOLD}% &lt; {settings.commission.commissionRates.PLATINUM}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
          loading={saving === 'commission'}
        >
          Save Commission Settings
        </SaveButton>
      </div>
    </div>
  );
}