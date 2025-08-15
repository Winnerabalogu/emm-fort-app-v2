"use client"
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  PlatformSettings, 
  SettingSection, 
  ApiResponse,
  GeneralSettingsTypes,
  CommissionSettingsTypes,
  NotificationSettingsTypes,
  PaymentSettingsTypes,
  SecuritySettingsTypes
} from '@/types/settings';

type SectionDataMap = {
  general: GeneralSettingsTypes;
  commission: CommissionSettingsTypes;
  notifications: NotificationSettingsTypes;
  payment: PaymentSettingsTypes;
  security: SecuritySettingsTypes;
};

// Helper type to get nested object keys
type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

// Helper type to get the value type of a nested property
type NestedValue<T, P extends keyof T, K extends keyof T[P]> = T[P][K];

interface UseSettingsReturn {
  settings: PlatformSettings | null;
  loading: boolean;
  saving: string | null;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: <T extends SettingSection>(
    section: T, 
    data: Partial<SectionDataMap[T]>
  ) => Promise<ApiResponse<PlatformSettings> | undefined>;
  updateSetting: <T extends SettingSection>(
    section: T, 
    field: keyof SectionDataMap[T], 
    value: SectionDataMap[T][keyof SectionDataMap[T]]
  ) => void;
  updateNestedSetting: <
    T extends SettingSection,
    P extends NestedKeys<SectionDataMap[T]>,
    K extends keyof SectionDataMap[T][P]
  >(
    section: T,
    parent: P,
    field: K,
    value: NestedValue<SectionDataMap[T], P, K>
  ) => void;
  resetSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch settings`);
      }

      const result: ApiResponse<PlatformSettings> = await response.json();
      
      if (result.success && result.data) {
        setSettings(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Invalid response format');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
      console.error('Error fetching settings:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async <T extends SettingSection>(
    section: T, 
    data: Partial<SectionDataMap[T]>
  ): Promise<ApiResponse<PlatformSettings> | undefined> => {
    try {
      setSaving(section);
      setError(null);

      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ section, data })
      });

      const result: ApiResponse<PlatformSettings> = await response.json();
      
      if (!response.ok) {
        if (result.details) {
          // Handle validation errors
          const errorMessages = Object.entries(result.details)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          throw new Error(`Validation errors:\n${errorMessages}`);
        }
        throw new Error(result.error || `HTTP ${response.status}: Failed to update settings`);
      }

      if (result.success) {
        const successMessage = result.message || `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`;
        toast.success(successMessage);
        
        // Refresh settings to get the latest data
        await fetchSettings();
        
        return result;
      } else {
        throw new Error(result.error || 'Failed to update settings');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      console.error(`Error updating ${section} settings:`, error);
      setError(errorMessage);
      toast.error(errorMessage);
      throw error; // Re-throw for component handling
    } finally {
      setSaving(null);
    }
  }, [fetchSettings]);

  const updateSetting = useCallback(<T extends SettingSection>(
    section: T, 
    field: keyof SectionDataMap[T], 
    value: SectionDataMap[T][keyof SectionDataMap[T]]
  ) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      } as PlatformSettings;
    });
  }, [settings]);

  const updateNestedSetting = useCallback(<
    T extends SettingSection,
    P extends NestedKeys<SectionDataMap[T]>,
    K extends keyof SectionDataMap[T][P]
  >(
    section: T,
    parent: P,
    field: K,
    value: NestedValue<SectionDataMap[T], P, K>
  ) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      
      const currentSection = prev[section] as SectionDataMap[T];
      const currentParent = currentSection[parent] as SectionDataMap[T][P];
      
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [parent]: {
            ...currentParent,
            [field]: value
          }
        }
      } as PlatformSettings;
    });
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings(null);
    setLoading(false);
    setSaving(null);
    setError(null);
  }, []);

  // Auto-refresh settings every 5 minutes when the page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !saving) {
        fetchSettings();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchSettings, saving]);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !settings && !loading) {
        fetchSettings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchSettings, settings, loading]);

  return {
    settings,
    loading,
    saving,
    error,
    fetchSettings,
    updateSettings,
    updateSetting,
    updateNestedSetting,
    resetSettings
  };
}