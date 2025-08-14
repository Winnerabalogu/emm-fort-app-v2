// components/admin/settings/PaymentSettings.tsx
import React from 'react';
import { SettingsSectionProps } from '@/types/settings';
import { PaymentGatewayCard } from './PaymentGatewayCard';
import { SaveButton } from './SaveButton';
import { AlertTriangle, Info } from 'lucide-react';

export function PaymentSettings({ 
  settings, 
  onNestedSettingsChange,
  onUpdate, 
  saving 
}: SettingsSectionProps) {
  const handleSave = () => {
    onUpdate('payment', settings.payment);
  };

  const enabledGateways = Object.entries(settings.payment.paymentGateways)
    .filter(([_, gateway]) => gateway.enabled).length;

  const hasValidConfiguration = Object.entries(settings.payment.paymentGateways)
    .some(([_, gateway]) => gateway.enabled && gateway.publicKey && gateway.secretKey);

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className={`border rounded-lg p-4 ${
        hasValidConfiguration ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
      }`}>
        <div className="flex items-start gap-3">
          {hasValidConfiguration ? (
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Info className="h-4 w-4 text-green-600" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          )}
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${
              hasValidConfiguration ? 'text-green-800' : 'text-amber-800'
            }`}>
              Payment Gateway Status
            </h3>
            <p className={`text-sm mt-1 ${
              hasValidConfiguration ? 'text-green-700' : 'text-amber-700'
            }`}>
              {hasValidConfiguration 
                ? `${enabledGateways} payment gateway${enabledGateways === 1 ? '' : 's'} configured and ready to process payments`
                : 'No payment gateways are properly configured. At least one gateway must be enabled with valid credentials.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Payment Gateways Configuration */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Payment Gateway Configuration
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paystack */}
          <PaymentGatewayCard
            name="paystack"
            gateway={settings.payment.paymentGateways.paystack}
            onChange={(updatedGateway) => 
              onNestedSettingsChange('payment', 'paymentGateways', 'paystack', updatedGateway)
            }
            color="blue"
          />

          {/* Flutterwave */}
          <PaymentGatewayCard
            name="flutterwave"
            gateway={settings.payment.paymentGateways.flutterwave}
            onChange={(updatedGateway) => 
              onNestedSettingsChange('payment', 'paymentGateways', 'flutterwave', updatedGateway)
            }
            color="orange"
          />
        </div>
      </div>

      {/* Supported Methods */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Supported Payment Methods
        </h4>
        <div className="flex flex-wrap gap-2">
          {settings.payment.supportedMethods.map((method) => (
            <span
              key={method}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• At least one payment gateway must be enabled and properly configured</li>
          <li>• Use test keys for development and live keys for production</li>
          <li>• Secret keys are encrypted and stored securely</li>
          <li>• Test your gateway configuration before going live</li>
        </ul>
      </div>

      {/* Validation Warning */}
      {!hasValidConfiguration && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Configuration Required</h4>
              <p className="text-sm text-red-700 mt-1">
                You must enable and configure at least one payment gateway with valid API keys 
                before users can make payments. The system will not allow saving without proper configuration.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
          loading={saving === 'payment'}
          disabled={!hasValidConfiguration}
        >
          Save Payment Settings
        </SaveButton>
      </div>
    </div>
  );
}