// components/admin/wordpress/modals/AddWordPressSaleModal.tsx
import { useState } from 'react';
import { Plus, Loader, X } from 'lucide-react';

interface AddWordPressSaleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddWordPressSaleModal({ onClose, onSuccess }: AddWordPressSaleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    customerEmail: '',
    affiliateUsername: '',
    amount: '',
    orderDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/wordpress-sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          orderDate: new Date(formData.orderDate).toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to create sale');
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      alert(error instanceof Error ? error.message : 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add WordPress Sale</h2>
              <p className="text-sm text-gray-500">Manually add a WordPress/WooCommerce sale</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order ID *
              </label>
              <input
                type="text"
                required
                value={formData.orderId}
                onChange={(e) => handleChange('orderId', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. 12345"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email *
              </label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="customer@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0.00"
              />
            </div>

            {/* Order Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date *
              </label>
              <input
                type="date"
                required
                value={formData.orderDate}
                onChange={(e) => handleChange('orderDate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Affiliate Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affiliate Username
                <span className="text-xs text-gray-500 ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.affiliateUsername}
                onChange={(e) => handleChange('affiliateUsername', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="affiliate_username"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
              <span className="text-xs text-gray-500 ml-1">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Additional notes about this sale..."
            />
          </div>

          {/* Commission Info */}
          {formData.affiliateUsername && formData.amount && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Commission Preview</h4>
              <p className="text-sm text-orange-700">
                If this sale is completed and the affiliate exists, a commission of{' '}
                <strong>₦{(parseFloat(formData.amount || '0') * 0.1).toLocaleString()}</strong>{' '}
                (10%) will be created for <strong>{formData.affiliateUsername}</strong>.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}