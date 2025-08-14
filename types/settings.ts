// types/settings.ts
export interface PlatformSettings {
  general: GeneralSettingsTypes;
  commission: CommissionSettingsTypes;
  notifications: NotificationSettingsTypes;
  payment: PaymentSettingsTypes;
  security: SecuritySettingsTypes;
}

export interface GeneralSettingsTypes {
 siteName: string;
  siteUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxUplineDepth: number;
  defaultTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface CommissionSettingsTypes {
 commissionRates: {
    BRONZE: number;
    SILVER: number;
    GOLD: number;
    PLATINUM: number;
  };
   minWithdrawalAmount: number;
  withdrawalFee: number;
  withdrawalProcessingDays: number;
}

export interface NotificationSettingsTypes {
  emailNotifications: boolean;
  smsNotifications: boolean;
  withdrawalNotifications: boolean;
  commissionNotifications: boolean;
  systemNotifications: boolean;
}

export interface PaymentGateway {
   enabled: boolean;
  publicKey: string;
  secretKey: string;
}

export interface PaymentSettingsTypes {
 supportedMethods: string[];
  paymentGateways: {
    paystack: PaymentGateway;
    flutterwave: PaymentGateway;
  };
}

export interface SecuritySettingsTypes {
  passwordMinLength: number;
  requireEmailVerification: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
  twoFactorAuth: boolean;
}

export interface ApiResponse<T = string[]> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, string[]>;
}

export type SettingSection = keyof PlatformSettings;

export interface SettingsUpdateProps {
  onUpdate: (section: SettingSection, data: unknown) => Promise<void>;
  saving: string | null;
}

export interface SettingsSectionProps extends SettingsUpdateProps {
  settings: PlatformSettings;
  onSettingsChange: (section: SettingSection, field: string, value: unknown) => void;
  onNestedSettingsChange: (section: SettingSection, parent: string, field: string, value: unknown) => void;
}