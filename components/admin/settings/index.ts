// components/admin/settings/index.ts


// Main components
export { default as AdminSettingsPage } from './AdminSettingsPage';

// Section components
export  {GeneralSettings}  from './GeneralSettings';
export { CommissionSettings } from './CommissionSettings';
export { NotificationSettings } from './NotificationSettings';
export { PaymentSettings } from './PaymentSettings';
export { SecuritySettings } from './SecuritySettings';

// Shared components
export { ToggleSwitch } from './ToggleSwitch';
export { SaveButton } from './SaveButton';
export { PaymentGatewayCard } from './PaymentGatewayCard';

// Hooks
export { useSettings } from '@/hooks/useSettings';

// Types
export type {
  PlatformSettings,
  PaymentGateway,
  SettingSection,
  ApiResponse,
  SettingsUpdateProps,
  SettingsSectionProps,
  GeneralSettingsTypes,
  NotificationSettingsTypes,
  CommissionSettingsTypes,
  PaymentSettingsTypes,
  SecuritySettingsTypes
} from '@/types/settings';