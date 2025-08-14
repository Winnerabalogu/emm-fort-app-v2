// components/admin/settings/PaymentGatewayCard.tsx
"use client"
import React, { useState } from 'react';
import { CreditCard, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentGateway } from '@/types/settings';

interface PaymentGatewayCardProps {
  name: string;
  gateway: PaymentGateway;
  onChange: (gateway: PaymentGateway) => void;
  color: 'blue' | 'orange' | 'purple' | 'green';
}

export function PaymentGatewayCard({ 
  name, 
  gateway, 
  onChange,
  color = 'blue'
}: PaymentGatewayCardProps) {
  const [showSecretKey, setShowSecretKey] = useState(false);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'bg-blue-50'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200',
      accent: 'bg-orange-50'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200',
      accent: 'bg-purple-50'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
      accent: 'bg-green-50'
    }
  };

  const colors = colorClasses[color];

  const isConfigured = gateway.enabled && gateway.publicKey && gateway.secretKey;

  const updateGateway = (updates: Partial<PaymentGateway>) => {
    onChange({ ...gateway, ...updates });
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      gateway.enabled ? colors.border : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            gateway.enabled ? colors.bg : 'bg-gray-100'
          }`}>
            <CreditCard className={`h-5 w-5 ${
              gateway.enabled ? colors.text : 'text-gray-400'
            }`} />
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-900 capitalize">{name}</h5>
            <div className="flex items-center gap-2 mt-1">
              {isConfigured ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-700">Configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-amber-700">
                    {gateway.enabled ? 'Missing Keys' : 'Disabled'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Enable/Disable Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={gateway.enabled}
            onChange={(e) => updateGateway({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
        </label>
      </div>
      
      {/* Configuration Fields */}
      {gateway.enabled && (
        <div className={`space-y-4 p-4 rounded-lg ${colors.accent}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Key
            </label>
            <input
              type="text"
              value={gateway.publicKey}
              onChange={(e) => updateGateway({ publicKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              placeholder={`${name === 'paystack' ? 'pk_test_' : 'FLWPUBK_TEST-'}...`}
            />
            {!gateway.publicKey && (
              <p className="text-xs text-red-600 mt-1">Public key is required when enabled</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={gateway.secretKey}
                onChange={(e) => updateGateway({ secretKey: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                placeholder={`${name === 'paystack' ? 'sk_test_' : 'FLWSECK_TEST-'}...`}
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {!gateway.secretKey && (
              <p className="text-xs text-red-600 mt-1">Secret key is required when enabled</p>
            )}
          </div>

          {/* Test Connection Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                // Add test connection logic here
                console.log(`Testing ${name} connection...`);
              }}
              disabled={!gateway.publicKey || !gateway.secretKey}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Test Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}