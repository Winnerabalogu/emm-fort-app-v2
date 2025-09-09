// app/creator/settings/page.tsx
"use client";

import { useState } from 'react';
import { User, Settings, ChevronRight, Shield, TrendingUp } from 'lucide-react';
import CreatorPersonalSettings from '@/components/creator/Dashboard/settings/CreatorPersonalSettings';
import CreatorSecuritySettings from '@/components/creator/Dashboard/settings/CreatorSecuritySettings';
import CreatorContentSettings from '@/components/creator/Dashboard/settings/CreatorContentSettings';

type Tab = 'profile' | 'content' | 'security';

export default function CreatorSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { 
      id: 'profile', 
      label: 'Creator Profile', 
      icon: User,
      description: 'Manage your creator profile and social links',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'content', 
      label: 'Content Preferences', 
      icon: TrendingUp,
      description: 'Set your content style and preferences',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'security', 
      label: 'Security & Payments', 
      icon: Shield,
      description: 'Account security and withdrawal settings',
      color: 'from-green-500 to-green-600'
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <CreatorPersonalSettings />;
      case 'content':
        return <CreatorContentSettings />;
      case 'security':
        return <CreatorSecuritySettings />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Creator Settings</h1>
          </div>
          <p className="text-white text-sm sm:text-base max-w-2xl">
            Customize your creator profile and manage your account preferences.
          </p>
        </div>
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
                  <span className="text-xs font-medium text-center">{tab.label.split(' ')[0]}</span>
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
  );
}