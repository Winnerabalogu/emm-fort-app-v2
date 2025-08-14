// components/admin/settings/GeneralSettings.tsx
import React from 'react';
import { SettingsSectionProps } from '@/types/settings';
import { ToggleSwitch } from './ToggleSwitch';
import { SaveButton } from './SaveButton';

export function GeneralSettings({ 
  settings, 
  onSettingsChange, 
  onUpdate, 
  saving 
}: SettingsSectionProps) {
  const handleSave = () => {
    onUpdate('general', settings.general);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => onSettingsChange('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Enter site name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => onSettingsChange('general', 'siteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="https://example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
          <input
            type="email"
            value={settings.general.supportEmail}
            onChange={(e) => onSettingsChange('general', 'supportEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="support@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Tier</label>
          <select
            value={settings.general.defaultTier}
            onChange={(e) => onSettingsChange('general', 'defaultTier', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="BRONZE">Bronze</option>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
            <option value="PLATINUM">Platinum</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Upline Depth
            <span className="text-xs text-gray-500 ml-1">(1-10)</span>
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.general.maxUplineDepth}
            onChange={(e) => onSettingsChange('general', 'maxUplineDepth', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <ToggleSwitch
          checked={settings.general.maintenanceMode}
          onChange={(checked) => onSettingsChange('general', 'maintenanceMode', checked)}
          label="Maintenance Mode"
          description="Enable to temporarily disable site access for all users"
        />
        
        <ToggleSwitch
          checked={settings.general.registrationEnabled}
          onChange={(checked) => onSettingsChange('general', 'registrationEnabled', checked)}
          label="User Registration"
          description="Allow new users to register on the platform"
        />
      </div>

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
          loading={saving === 'general'}
        >
          Save General Settings
        </SaveButton>
      </div>
    </div>
  );
}