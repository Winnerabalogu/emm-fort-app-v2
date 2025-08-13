// components/admin/wordpress/modals/ViewWordPressSaleModal.tsx
"use client";

import React from 'react';
import { X, ShoppingCart, User, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface WordPressSale {
  id: string;
  orderId: string;
  customerEmail: string;
  affiliateUsername?: string;
  amount: number;
  orderDate: string;
  status: string;
  processedAt?: string;
  description?: string;
  affiliate?: {
    id: string;
    fullName: string;
    username: string;
    tier: string;
  };
  createdAt: string;
}

interface ViewWordPressSaleModalProps {
  sale: WordPressSale;
  onClose: () => void;
}

export function ViewWordPressSaleModal({ sale, onClose }: ViewWordPressSaleModalProps) {
  const isProcessed = sale.processedAt !== null || sale.status === 'completed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                WordPress Sale Details
              </h2>
              <p className="text-sm text-gray-500">Order #{sale.orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border ${
            isProcessed 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              {isProcessed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className={`font-medium ${
                isProcessed ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {isProcessed ? 'Commission Processed' : 'Pending Commission Processing'}
              </span>
            </div>
            {sale.processedAt && (
              <p className="text-sm text-green-700 mt-1">
                Processed on {new Date(sale.processedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Order ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      #{sale.orderId}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Email</label>
                  <div className="text-sm text-gray-900 mt-1">{sale.customerEmail}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-semibold text-gray-900">
                      ₦{sale.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sale.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Affiliate & Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
              
              <div className="space-y-3">
                {/* Affiliate */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Affiliate</label>
                  <div className="mt-1">
                    {sale.affiliate || sale.affiliateUsername ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {sale.affiliate?.fullName || sale.affiliateUsername}
                          </div>
                          {sale.affiliate && (
                            <div className="text-xs text-gray-500">
                              @{sale.affiliate.username} • {sale.affiliate.tier}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">No affiliate assigned</span>
                    )}
                  </div>
                </div>
                
                {/* Order Date */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Date</label>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(sale.orderDate).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Created Date */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(sale.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Info */}
          {sale.affiliate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Commission Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-700">Commission Rate:</span>
                  <span className="ml-2 font-medium">10%</span>
                </div>
                <div>
                  <span className="text-orange-700">Commission Amount:</span>
                  <span className="ml-2 font-medium">₦{(sale.amount * 0.1).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {sale.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <div className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">
                {sale.description}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

