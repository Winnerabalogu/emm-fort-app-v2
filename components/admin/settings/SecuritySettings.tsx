// components/admin/settings/SecuritySettings.tsx
import React from 'react';
import { SettingsSectionProps } from '@/types/settings';
import { ToggleSwitch } from './ToggleSwitch';
import { SaveButton } from './SaveButton';
import { AlertTriangle, Shield, Clock, Lock, Key } from 'lucide-react';

export function SecuritySettings({ 
  settings, 
  onSettingsChange, 
  onUpdate, 
  saving 
}: SettingsSectionProps) {
  const handleSave = () => {
    onUpdate('security', settings.security);
  };

  const formatSessionTimeout = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getSecurityLevel = () => {
    let score = 0;
    if (settings.security.passwordMinLength >= 8) score++;
    if (settings.security.requireEmailVerification) score++;
    if (settings.security.maxLoginAttempts <= 5) score++;
    if (settings.security.sessionTimeout <= 480) score++;
    if (settings.security.twoFactorAuth) score += 2; // 2FA is worth more

    if (score >= 5) return { level: 'High', color: 'green' };
    if (score >= 3) return { level: 'Medium', color: 'amber' };
    return { level: 'Low', color: 'red' };
  };

  const securityLevel = getSecurityLevel();

  return (
    <div className="space-y-6">
      {/* Security Level Indicator */}
      <div className={`border rounded-lg p-4 ${
        securityLevel.color === 'green' ? 'border-green-200 bg-green-50' :
        securityLevel.color === 'amber' ? 'border-amber-200 bg-amber-50' :
        'border-red-200 bg-red-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              securityLevel.color === 'green' ? 'bg-green-100' :
              securityLevel.color === 'amber' ? 'bg-amber-100' :
              'bg-red-100'
            }`}>
              <Shield className={`h-5 w-5 ${
                securityLevel.color === 'green' ? 'text-green-600' :
                securityLevel.color === 'amber' ? 'text-amber-600' :
                'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className={`text-sm font-medium ${
                securityLevel.color === 'green' ? 'text-green-800' :
                securityLevel.color === 'amber' ? 'text-amber-800' :
                'text-red-800'
              }`}>
                Security Level: {securityLevel.level}
              </h3>
              <p className={`text-xs mt-1 ${
                securityLevel.color === 'green' ? 'text-green-700' :
                securityLevel.color === 'amber' ? 'text-amber-700' :
                'text-red-700'
              }`}>
                {securityLevel.level === 'High' && 'Your platform has strong security measures in place'}
                {securityLevel.level === 'Medium' && 'Consider enabling additional security features'}
                {securityLevel.level === 'Low' && 'Your platform needs stronger security measures'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            securityLevel.color === 'green' ? 'bg-green-100 text-green-800' :
            securityLevel.color === 'amber' ? 'bg-amber-100 text-amber-800' :
            'bg-red-100 text-red-800'
          }`}>
            {securityLevel.level}
          </div>
        </div>
      </div>

      {/* Password & Authentication */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Password & Authentication
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
              <span className="text-xs text-gray-500 ml-1">(6-50 chars)</span>
            </label>
            <input
              type="number"
              min="6"
              max="50"
              value={settings.security.passwordMinLength}
              onChange={(e) => onSettingsChange('security', 'passwordMinLength', parseInt(e.target.value) || 6)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Currently: {settings.security.passwordMinLength} characters minimum
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
              <span className="text-xs text-gray-500 ml-1">(3-10 attempts)</span>
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => onSettingsChange('security', 'maxLoginAttempts', parseInt(e.target.value) || 3)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Account locked after {settings.security.maxLoginAttempts} failed attempts
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <ToggleSwitch
            checked={settings.security.requireEmailVerification}
            onChange={(checked) => onSettingsChange('security', 'requireEmailVerification', checked)}
            label="Require Email Verification"
            description="Users must verify their email address before accessing the platform"
          />

          <ToggleSwitch
            checked={settings.security.twoFactorAuth}
            onChange={(checked) => onSettingsChange('security', 'twoFactorAuth', checked)}
            label="Two-Factor Authentication (2FA)"
            description="Enable 2FA for enhanced account security (strongly recommended)"
          />
        </div>
      </div>

      {/* Session Management */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Management
        </h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout
            <span className="text-xs text-gray-500 ml-1">(15 min - 7 days)</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="15"
              max="10080"
              step="15"
              value={settings.security.sessionTimeout}
              onChange={(e) => onSettingsChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="min-w-0 flex-shrink-0">
              <span className="text-sm font-medium text-gray-900">
                {formatSessionTimeout(settings.security.sessionTimeout)}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>15 min</span>
            <span>7 days</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Users will be automatically logged out after this period of inactivity
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Presets:</p>
          <div className="flex gap-2">
            {[
              { label: '30 min', value: 30 },
              { label: '1 hour', value: 60 },
              { label: '4 hours', value: 240 },
              { label: '1 day', value: 1440 }
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => onSettingsChange('security', 'sessionTimeout', preset.value)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  settings.security.sessionTimeout === preset.value
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Key className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Security Recommendations</h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• Use minimum 8 characters for password length</li>
              <li>• Enable email verification to prevent fake accounts</li>
              <li>• Limit login attempts to 5 or fewer to prevent brute force attacks</li>
              <li>• Set session timeout to 8 hours or less for sensitive operations</li>
              <li>• Enable 2FA for administrators and high-value accounts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Critical Changes Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Important Security Notice</h4>
            <p className="text-sm text-red-700 mt-1">
              Changes to security settings will affect all users immediately. Some changes may require 
              users to log in again or complete additional verification steps. Communicate any changes 
              that might impact user access in advance.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton
          onClick={handleSave}
          loading={saving === 'security'}
        >
          Save Security Settings
        </SaveButton>
      </div>
    </div>
  );
}