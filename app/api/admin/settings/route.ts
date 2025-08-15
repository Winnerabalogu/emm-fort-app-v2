/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/admin/settings/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { RouteContext, withAdmin } from '@/lib/auth-admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { User } from 'next-auth';

// Validation schemas with production-ready constraints
const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100, 'Site name too long'),
  siteUrl: z.string().url('Must be a valid URL'),
  supportEmail: z.string().email('Must be a valid email address'),
  maintenanceMode: z.boolean(),
  registrationEnabled: z.boolean(),
  maxUplineDepth: z.number().int().min(1).max(10),
  defaultTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'])
});

const commissionSettingsSchema = z.object({
  commissionRates: z.object({
    BRONZE: z.number().min(0, 'Rate cannot be negative').max(50, 'Rate too high'),
    SILVER: z.number().min(0, 'Rate cannot be negative').max(50, 'Rate too high'),
    GOLD: z.number().min(0, 'Rate cannot be negative').max(50, 'Rate too high'),
    PLATINUM: z.number().min(0, 'Rate cannot be negative').max(50, 'Rate too high')
  }),
  minWithdrawalAmount: z.number().min(100, 'Minimum withdrawal too low').max(1000000),
  withdrawalFee: z.number().min(0).max(10000),
  withdrawalProcessingDays: z.number().int().min(1).max(14, 'Processing time too long')
});

const notificationsSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  withdrawalNotifications: z.boolean(),
  commissionNotifications: z.boolean(),
  systemNotifications: z.boolean()
});

const paymentSettingsSchema = z.object({
  supportedMethods: z.array(z.string()).min(1, 'At least one payment method required'),
  paymentGateways: z.object({
    paystack: z.object({
      enabled: z.boolean(),
      publicKey: z.string().min(1, 'Public key required when enabled'),
      secretKey: z.string().min(1, 'Secret key required when enabled')
    }),
    flutterwave: z.object({
      enabled: z.boolean(),
      publicKey: z.string().min(1, 'Public key required when enabled'),
      secretKey: z.string().min(1, 'Secret key required when enabled')
    })
  })
}).refine((data) => {
  // At least one payment gateway must be enabled
  return data.paymentGateways.paystack.enabled || data.paymentGateways.flutterwave.enabled;
}, {
  message: 'At least one payment gateway must be enabled'
});

const securitySettingsSchema = z.object({
  passwordMinLength: z.number().int().min(6, 'Minimum 6 characters').max(128),
  requireEmailVerification: z.boolean(),
  maxLoginAttempts: z.number().int().min(3).max(10),
  sessionTimeout: z.number().int().min(15, 'Minimum 15 minutes').max(10080, 'Maximum 7 days'),
  twoFactorAuth: z.boolean()
});

const updateRequestSchema = z.object({
  section: z.enum(['general', 'commission', 'notifications', 'payment', 'security']),
  data: z.any()
});

// Default settings
const defaultSettings = {
  general: {
    siteName: process.env.SITE_NAME || 'EmmFort Platform',
    siteUrl: process.env.SITE_URL || 'https://emmfort.com',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@emmfort.com',
    maintenanceMode: false,
    registrationEnabled: true,
    maxUplineDepth: 5,
    defaultTier: 'SiLVER'
  },
  commission: {
    commissionRates: {
      BRONZE: 5.0,
      SILVER: 10.0,
      GOLD: 15.0,
      PLATINUM: 20.0
    },
    minWithdrawalAmount: 5000.0,
    withdrawalFee: 100.0,
    withdrawalProcessingDays: 3
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    withdrawalNotifications: true,
    commissionNotifications: true,
    systemNotifications: true
  },
  payment: {
    supportedMethods: ['paystack'],
    paymentGateways: {
      paystack: {
        enabled: Boolean(process.env.PAYSTACK_PUBLIC_KEY),
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
        secretKey: process.env.PAYSTACK_SECRET_KEY || ''
      },
      flutterwave: {
        enabled: Boolean(process.env.FLUTTERWAVE_PUBLIC_KEY),
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY || ''
      }
    }
  },
  security: {
    passwordMinLength: 8,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 1440,
    twoFactorAuth: false
  }
};

async function getSettingsFromDB(): Promise<typeof defaultSettings> {
  try {
    const settings = await prisma.platformSettings.findMany({
      select: {
        section: true,
        data: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const settingsMap = { ...defaultSettings };
    
    settings.forEach(setting => {
      const sectionKey = setting.section as keyof typeof defaultSettings;
      const sectionDefaults = defaultSettings[sectionKey];
      const mergedData = { 
        ...sectionDefaults,
        ...(setting.data as Record<string, unknown>)
      };
      
      // Use Object.assign for type-safe assignment
      Object.assign(settingsMap[sectionKey], mergedData);
    });

    return settingsMap;
  } catch (error) {
    console.error('Error fetching settings from database:', error);
    // Return defaults if database query fails
    return defaultSettings;
  }
}

export const GET = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const settings = await getSettingsFromDB();
    
    // Type assertion to access nested properties safely
    const settingsTyped = settings as typeof defaultSettings;
    
    // Sanitize sensitive data before sending to client
    const sanitizedSettings = {
      ...settingsTyped,
      payment: {
        ...settingsTyped.payment,
        paymentGateways: {
          paystack: {
            ...settingsTyped.payment.paymentGateways.paystack,
            secretKey: settingsTyped.payment.paymentGateways.paystack.secretKey ? '••••••••' : ''
          },
          flutterwave: {
            ...settingsTyped.payment.paymentGateways.flutterwave,
            secretKey: settingsTyped.payment.paymentGateways.flutterwave.secretKey ? '••••••••' : ''
          }
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: sanitizedSettings
    });

  } catch (error) {
    console.error('GET_SETTINGS_ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 });
  }
});

export const PATCH = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    const body = await req.json();
    const { section, data } = updateRequestSchema.parse(body);

    // Validate data based on section
    let validatedData;
    let schema;
    
    switch (section) {
      case 'general':
        schema = generalSettingsSchema;
        validatedData = schema.parse(data);
        break;
      case 'commission':
        schema = commissionSettingsSchema;
        validatedData = schema.parse(data);
        
        // Business logic validation
        const rates = validatedData.commissionRates;
        if (rates.BRONZE >= rates.SILVER || rates.SILVER >= rates.GOLD || rates.GOLD >= rates.PLATINUM) {
          return NextResponse.json({
            success: false,
            error: 'Commission rates must increase with tier level'
          }, { status: 400 });
        }
        break;
        
      case 'notifications':
        schema = notificationsSettingsSchema;
        validatedData = schema.parse(data);
        break;
        
      case 'payment':
        schema = paymentSettingsSchema;
        
        // Handle secret key updates (don't override with masked values)
        const currentSettings = await getSettingsFromDB();
        const currentPaymentSettings = currentSettings.payment;
        
        const processedData = {
          ...data,
          paymentGateways: {
            paystack: {
              ...data.paymentGateways.paystack,
              secretKey: data.paymentGateways.paystack.secretKey === '••••••••' 
                ? currentPaymentSettings.paymentGateways.paystack.secretKey
                : data.paymentGateways.paystack.secretKey
            },
            flutterwave: {
              ...data.paymentGateways.flutterwave,
              secretKey: data.paymentGateways.flutterwave.secretKey === '••••••••'
                ? currentPaymentSettings.paymentGateways.flutterwave.secretKey
                : data.paymentGateways.flutterwave.secretKey
            }
          }
        };
        
        validatedData = schema.parse(processedData);
        break;
        
      case 'security':
        schema = securitySettingsSchema;
        validatedData = schema.parse(data);
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid settings section'
        }, { status: 400 });
    }

    // Save to database using Prisma's upsert
    await prisma.platformSettings.upsert({
      where: {
        section: section
      },
      update: {
        data: validatedData,
        updatedBy: admin.id,
        updatedAt: new Date()
      },
      create: {
        section: section,
        data: validatedData,
        updatedBy: admin.id
      }
    });

    // Log the change for audit trail
    console.log(`Settings updated: ${section} by admin ${admin.id} (${admin.username || admin.email})`);

    // Additional logging for critical changes
    if (section === 'security' || section === 'payment') {
      console.log(`CRITICAL SETTINGS CHANGE: ${section} updated by ${admin.username || admin.email} at ${new Date().toISOString()}`);
    }

    // Trigger cache invalidation or other side effects if needed
    // await invalidateSettingsCache();

    return NextResponse.json({
      success: true,
      message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('UPDATE_SETTINGS_ERROR:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid settings data provided',
        details: error.flatten().fieldErrors
      }, { status: 400 });
    }

    // Log security-related errors more prominently
    if (error instanceof Error && error.message.includes('payment')) {
      console.error(`PAYMENT SETTINGS ERROR: ${error.message}`);
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update settings. Please try again.'
    }, { status: 500 });
  }
});

// Health check endpoint for settings
export const HEAD = withAdmin(async (req: NextRequest, admin: User, context: RouteContext) => {
  try {
    // Quick health check - just verify we can read settings
    await getSettingsFromDB();
    return new NextResponse(null, { status: 200 });
  } catch (_) {
    return new NextResponse(null, { status: 500 });
  }
});