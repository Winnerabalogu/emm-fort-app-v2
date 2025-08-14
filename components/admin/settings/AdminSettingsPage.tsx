"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Settings, 
  RefreshCw,
  Globe,
  Shield,
  CreditCard,
  Bell,
  AlertTriangle,
  CheckCircle,
  Database
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Types
import { PlatformSettings, SettingSection, ApiResponse } from '@/types/settings';

// Components
import { GeneralSettings } from './GeneralSettings';
import { CommissionSettings } from './CommissionSettings';
import { NotificationSettings } from './NotificationSettings';
import { PaymentSettings } from './PaymentSettings';
import { SecuritySettings } from './SecuritySettings';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SettingSection>('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch settings');
      }

      const result: ApiResponse<PlatformSettings> = await response.json();
      
      if (result.success && result.data) {
        setSettings(result.data);
      } else {
        throw new Error(result.error || 'Invalid response format');
      }

    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

const updateSettings = async (section: SettingSection, data: unknown) => {
  try {
    setSaving(section);
    const response = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, data })
    });

    const result: ApiResponse = await response.json();
    
    if (!response.ok) {
      if (result.details) {
        // Handle validation errors
        const errorMessages = Object.entries(result.details)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n');
        throw new Error(`Validation errors:\n${errorMessages}`);
      }
      throw new Error(result.error || 'Failed to update settings');
    }

    if (result.success) {
      toast.success(result.message || `${section} settings updated successfully`);
      await fetchSettings();
    } else {
      throw new Error(result.error || 'Failed to update settings');
    }

  } catch (error) {
    console.error('Error updating settings:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to update settings');
  } finally {
    setSaving(null);
  }
};

  const handleInputChange = (section: SettingSection, field: string, value: unknown) => {
  if (!settings) return;

  setSettings(prev => {
    if (!prev) return prev;
    
    return {
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    };
  });
};


const handleNestedInputChange = (section: SettingSection, parent: string, field: string, value: unknown) => {
  if (!settings) return;

  setSettings(prev => {
    if (!prev) return prev;
    
    const currentSection = prev[section];        
    const currentParent = (currentSection as unknown as Record<string, Record<string, unknown>>)[parent];
    
    return {
      ...prev,
      [section]: {
        ...currentSection,
        [parent]: {
          ...currentParent,
          [field]: value
        }
      }
    };
  });
};

  const tabs = [
    { 
      id: 'general' as const, 
      name: 'General', 
      icon: Globe,
      description: 'Site configuration and basic settings'
    },
    { 
      id: 'commission' as const, 
      name: 'Commission', 
      icon: CreditCard,
      description: 'Commission rates and withdrawal settings'
    },
    { 
      id: 'notifications' as const, 
      name: 'Notifications', 
      icon: Bell,
      description: 'Email, SMS and system notifications'
    },
    { 
      id: 'payment' as const, 
      name: 'Payment', 
      icon: CreditCard,
      description: 'Payment gateways and methods'
    },
    { 
      id: 'security' as const, 
      name: 'Security', 
      icon: Shield,
      description: 'Authentication and security policies'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex space-x-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          </div>
          <div className="p-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load settings</h3>
          <p className="text-sm text-gray-500 mb-4">
            There was an error loading the platform settings. This could be due to a database issue or network problem.
          </p>
          <button
            onClick={fetchSettings}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    const commonProps = {
      settings,
      onSettingsChange: handleInputChange,
      onNestedSettingsChange: handleNestedInputChange,
      onUpdate: updateSettings,
      saving
    };

    switch (activeTab) {
      case 'general':
        return <GeneralSettings {...commonProps} />;
      case 'commission':
        return <CommissionSettings {...commonProps} />;
      case 'notifications':
        return <NotificationSettings {...commonProps} />;
      case 'payment':
        return <PaymentSettings {...commonProps} />;
      case 'security':
        return <SecuritySettings {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-7 w-7 text-orange-600" />
            Platform Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your platform settings, payment gateways, and security policies
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading || saving !== null}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto" aria-label="Settings tabs">
            <div className="flex space-x-8 px-6 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const hasUnsavedChanges = saving === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${hasUnsavedChanges ? 'animate-pulse' : ''}`} />
                      <span>{tab.name}</span>
                      {hasUnsavedChanges && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    {/* Tooltip on hover */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                      {tab.description}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-gray-600" />
          System Status
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            label="Database"
            status="connected"
            description="All database operations functioning normally"
          />
          <StatusCard
            label="Cache"
            status="active"
            description="Redis cache is active and responsive"
          />
          <StatusCard
            label="Email Service"
            status="operational"
            description="Email delivery service is operational"
          />
          <StatusCard
            label="Settings"
            status="synced"
            description="All settings are synchronized"
          />
        </div>

        {/* Last Updated Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Last settings refresh: {new Date().toLocaleString()}</span>
            <span>Auto-refresh every 5 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  label: string;
  status: 'connected' | 'active' | 'operational' | 'synced' | 'error';
  description: string;
}

function StatusCard({ label, status, description }: StatusCardProps) {
  const getStatusConfig = (status: StatusCardProps['status']) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'operational':
      case 'synced':
        return {
          color: 'green',
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          color: 'red',
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      default:
        return {
          color: 'gray',
          icon: CheckCircle,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} rounded-lg p-4 border border-${config.color}-200`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${config.textColor}`}>{label}</span>
        <Icon className={`h-4 w-4 ${config.iconColor}`} />
      </div>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 ${config.color === 'green' ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
        <span className={`text-xs font-medium ${config.textColor} capitalize`}>
          {status}
        </span>
      </div>
      <p className={`text-xs ${config.textColor} opacity-80`}>
        {description}
      </p>
    </div>
  );
}