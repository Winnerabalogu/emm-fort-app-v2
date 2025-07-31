// app/dashboard/settings/page.tsx
"use client";

import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import PersonalSettings from '@/components/dashboard/settings/PersonalSettings';
import { User, Shield, TrendingUp, Settings, ChevronRight } from 'lucide-react';
import SecuritySettings from '@/components/dashboard/settings/SecuritySettings';
import DownlineStatsTab from '@/components/dashboard/settings/DownlineStatsTab';

type Tab = 'personal' | 'downline' | 'security';

function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  const tabs = [
    { 
      id: 'personal', 
      label: 'Personal Details', 
      icon: User,
      description: 'Manage your profile information',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'downline', 
      label: 'Downline Analytics', 
      icon: TrendingUp,
      description: 'View your network statistics',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'security', 
      label: 'Security & Payments', 
      icon: Shield,
      description: 'Password and payment settings',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalSettings />;
      case 'downline':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8 border border-green-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Downline Analytics</h2>
                  <p className="text-gray-600 mt-1">Track your network growth and performance metrics.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
             <DownlineStatsTab/>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Security & Payments</h2>
                  <p className="text-gray-600 mt-1">Manage your account security and payment preferences.</p>
                </div>
              </div>
            </div>            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                 <SecuritySettings />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 sm:p-8 sm:py-8">
      <div className="w-full sm:px-6 lg:px-8">
        <div className="space-y-8 sm:p-8">
          {/* Header */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Account Settings</h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
              Manage your profile, security, and preferences to keep your account secure and up-to-date.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            {/* Mobile Tab Navigation */}
            <div className="xl:hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`flex flex-col items-center gap-2 px-3 py-4 transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-b from-orange-500 to-amber-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="h-5 w-5 flex-shrink-0" />                      
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Sidebar Navigation */}
            <div className="hidden xl:block xl:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 group ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          activeTab === tab.id
                            ? 'bg-white/20'
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <tab.icon className={`h-5 w-5 ${
                            activeTab === tab.id ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{tab.label}</p>
                          <p className={`text-xs ${
                            activeTab === tab.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {tab.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${
                        activeTab === tab.id ? 'rotate-90 text-white' : 'text-gray-400'
                      }`} />
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className="transition-all duration-300 ease-in-out">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <SessionProvider>
      <SettingsPageContent />
    </SessionProvider>
  );
}