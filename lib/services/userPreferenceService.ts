// lib/services/userPreferenceService.ts
import { prisma } from '@/lib/prisma';

// Union type for all possible preference values
export type PreferenceValue = 
  | string 
  | number 
  | boolean 
  | TemplateOrderItem[] 
  | CaptionOrderItem[] 
  | DashboardLayout 
  | ContentFilters
  | null;

export interface UserPreferenceData {
  [key: string]: PreferenceValue;
}

export class UserPreferenceService {
  /**
   * Get a user preference by key
   */
  static async getPreference(userId: string, key: string): Promise<PreferenceValue> {
    try {
      const preference = await prisma.userPreference.findUnique({
        where: {
          UserPreference_userId_key_unique: {
            userId,
            key
          }
        },
        select: {
          value: true,
          updatedAt: true
        }
      });

      if (!preference) {
        return null;
      }

      try {
        return JSON.parse(preference.value) as PreferenceValue;
      } catch (parseError) {
        console.error(`Failed to parse preference ${key} for user ${userId}:`, parseError);
        return preference.value; // Return raw string if JSON parsing fails
      }
    } catch (error) {
      console.error(`Error getting preference ${key} for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Set a user preference
   */
  static async setPreference(userId: string, key: string, value: PreferenceValue): Promise<boolean> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

      await prisma.userPreference.upsert({
        where: {
          UserPreference_userId_key_unique: {
            userId,
            key
          }
        },
        update: {
          value: serializedValue,
          updatedAt: new Date()
        },
        create: {
          userId,
          key,
          value: serializedValue
        }
      });

      return true;
    } catch (error) {
      console.error(`Error setting preference ${key} for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get multiple preferences for a user
   */
  static async getPreferences(userId: string, keys?: string[]): Promise<UserPreferenceData | null> {
    try {
      const where: { userId: string; key?: { in: string[] } } = { userId };
      if (keys && keys.length > 0) {
        where.key = { in: keys };
      }

      const preferences = await prisma.userPreference.findMany({
        where,
        select: {
          key: true,
          value: true,
          updatedAt: true
        }
      });

      const result: UserPreferenceData = {};

      preferences.forEach(pref => {
        try {
          result[pref.key] = JSON.parse(pref.value) as PreferenceValue;
        } catch (parseError) {
          console.error(`Failed to parse preference ${pref.key}:`, parseError);
          result[pref.key] = pref.value; // Return raw string if JSON parsing fails
        }
      });

      return result;
    } catch (error) {
      console.error(`Error getting preferences for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Delete a user preference
   */
  static async deletePreference(userId: string, key: string): Promise<boolean> {
    try {
      await prisma.userPreference.delete({
        where: {
          UserPreference_userId_key_unique: {
            userId,
            key
          }
        }
      });

      return true;
    } catch (error) {
      console.error(`Error deleting preference ${key} for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Delete all preferences for a user
   */
  static async deleteAllPreferences(userId: string): Promise<boolean> {
    try {
      await prisma.userPreference.deleteMany({
        where: { userId }
      });

      return true;
    } catch (error) {
      console.error(`Error deleting all preferences for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Template-specific methods
   */
  static async getTemplateOrder(userId: string): Promise<TemplateOrderItem[]> {
    const order = await this.getPreference(userId, 'templateOrder');
    return Array.isArray(order) ? order : [];
  }

  static async setTemplateOrder(userId: string, order: TemplateOrderItem[]): Promise<boolean> {
    return await this.setPreference(userId, 'templateOrder', order);
  }

  /**
   * Caption-specific methods
   */
  static async getCaptionOrder(userId: string): Promise<CaptionOrderItem[]> {
    const order = await this.getPreference(userId, 'captionOrder');
    return Array.isArray(order) ? order : [];
  }

  static async setCaptionOrder(userId: string, order: CaptionOrderItem[]): Promise<boolean> {
    return await this.setPreference(userId, 'captionOrder', order);
  }

  /**
   * Dashboard layout methods
   */
  static async getDashboardLayout(userId: string): Promise<DashboardLayout | null> {
    const layout = await this.getPreference(userId, 'dashboardLayout');
    return layout && typeof layout === 'object' && !Array.isArray(layout) ? layout as DashboardLayout : null;
  }

  static async setDashboardLayout(userId: string, layout: DashboardLayout): Promise<boolean> {
    return await this.setPreference(userId, 'dashboardLayout', layout);
  }

  /**
   * Content filters methods
   */
  static async getContentFilters(userId: string): Promise<ContentFilters | null> {
    const filters = await this.getPreference(userId, 'contentFilters');
    return filters && typeof filters === 'object' && !Array.isArray(filters) ? filters as ContentFilters : null;
  }

  static async setContentFilters(userId: string, filters: ContentFilters): Promise<boolean> {
    return await this.setPreference(userId, 'contentFilters', filters);
  }
}

// Export default instance
export const userPrefs = UserPreferenceService;

// Types for commonly used preferences
export interface TemplateOrderItem {
  id: string;
  order: number;
}

export interface CaptionOrderItem {
  id: string;
  order: number;
}

export interface DashboardLayout {
  sidebarCollapsed?: boolean;
  theme?: 'light' | 'dark';
  gridView?: 'card' | 'list';
}

export interface ContentFilters {
  platform?: string;
  type?: string;
  difficulty?: string;
  engagement?: string;
}