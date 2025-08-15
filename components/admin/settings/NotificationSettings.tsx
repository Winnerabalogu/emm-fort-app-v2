// components/admin/settings/NotificationSettings.tsx
import React from 'react';
import { SettingsSectionProps } from '@/types/settings';
import { SaveButton } from './SaveButton';
import { Mail, MessageSquare, CreditCard, Users, Settings } from 'lucide-react';

export function NotificationSettings({ 
  settings, 
  onSettingsChange, 
  onUpdate, 
  saving 
}: SettingsSectionProps) {
  const handleSave = () => {
    onUpdate('notifications', settings.notifications);
  };

  const notificationTypes = [
    {
      key: 'emailNotifications' as keyof typeof settings.notifications,
      label: 'Email Notifications',
      description: 'Send email notifications to users for various events',
      icon: Mail
    },
    {
      key: 'smsNotifications' as keyof typeof settings.notifications,
      label: 'SMS Notifications',
      description: 'Send SMS notifications to users (requires SMS service)',
      icon: MessageSquare
    },
    {
      key: 'withdrawalNotifications' as keyof typeof settings.notifications,
      label: 'Withdrawal Notifications',
      description: 'Notify users about withdrawal status changes and updates',
      icon: CreditCard
    },
    {
      key: 'commissionNotifications' as keyof typeof settings.notifications,
      label: 'Commission Notifications',
      description: 'Notify users when they earn new commissions from referrals',
      icon: Users
    },
    {
      key: 'systemNotifications' as keyof typeof settings.notifications,
      label: 'System Notifications',
      description: 'Send system updates, maintenance notices, and announcements',
      icon: Settings
    }
  ];

  const enabledCount = Object.values(settings.notifications).filter(Boolean).length;
  const totalCount = Object.keys(settings.notifications).length;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-900">Notification Overview</h3>
            <p className="text-sm text-blue-700 mt-1">
              {enabledCount} of {totalCount} notification types are currently enabled
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">{enabledCount}/{totalCount}</div>
            <div className="text-sm text-blue-700">Active</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(enabledCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Notification Controls */}
      <div className="space-y-4">
        {notificationTypes.map((type) => {
          const Icon = type.icon;
          const isEnabled = settings.notifications[type.key];
          
          return (
            <div 
              key={type.key} 
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${
                      isEnabled ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      isEnabled ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {type.description}
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => onSettingsChange('notifications', type.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
            <p className="text-sm text-gray-500">Manage all notifications at once</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                Object.keys(settings.notifications).forEach(key => {
                  onSettingsChange('notifications', key, true);
                });
              }}
              className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => {
                Object.keys(settings.notifications).forEach(key => {
                  onSettingsChange('notifications', key, false);
                });
              }}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Disable All
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
          loading={saving === 'notifications'}
        >
          Save Notification Settings
        </SaveButton>
      </div>
    </div>
  );
}