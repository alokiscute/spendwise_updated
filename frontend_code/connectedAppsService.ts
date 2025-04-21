import { storage } from "../storage";
import { insertConnectedAppSchema, type InsertConnectedApp } from "@shared/schema";
import { z } from "zod";

// For validation
const appTypeEnum = z.enum(['shopping', 'food', 'entertainment', 'music', 'other']);
const connectAppSchema = insertConnectedAppSchema.extend({
  appType: appTypeEnum,
  website: z.string().url(),
  appIcon: z.string().optional()
});

// Common app URLs
const APP_URLS: Record<string, string> = {
  'amazon': 'https://amazon.com',
  'zomato': 'https://zomato.com',
  'ubereats': 'https://ubereats.com',
  'walmart': 'https://walmart.com',
  'target': 'https://target.com',
  'netflix': 'https://netflix.com',
  'spotify': 'https://spotify.com',
  'hulu': 'https://hulu.com',
  'disney+': 'https://disneyplus.com',
  'doordash': 'https://doordash.com',
  'grubhub': 'https://grubhub.com',
  'instacart': 'https://instacart.com',
  'ebay': 'https://ebay.com',
  'etsy': 'https://etsy.com',
};

// Sample spending data for apps
export interface AppSpending {
  appId: number;
  appName: string; 
  appType: string;
  amount: number;
  month: number;
  year: number;
}

/**
 * Service for handling connected apps and their related operations
 */
export class ConnectedAppsService {
  /**
   * Get all connected apps for a user
   */
  async getUserConnectedApps(userId: number) {
    return storage.getConnectedApps(userId);
  }

  /**
   * Connect a new app for a user
   */
  async connectApp(userId: number, appData: z.infer<typeof connectAppSchema>) {
    try {
      // Ensure the app has a valid URL
      if (!appData.website) {
        // Try to use a common URL if available
        const appNameLower = appData.appName.toLowerCase();
        if (APP_URLS[appNameLower]) {
          appData.website = APP_URLS[appNameLower];
        } else {
          // Default fallback URL pattern
          appData.website = `https://${appNameLower.replace(/\s+/g, '')}.com`;
        }
      }

      // Prepare app data for database insertion
      const newApp: InsertConnectedApp = {
        userId,
        appName: appData.appName,
        appType: appData.appType,
        connected: true
      };

      // Create the app in the database
      return await storage.createConnectedApp(newApp);
    } catch (error) {
      console.error("Error connecting app:", error);
      throw error;
    }
  }

  /**
   * Disconnect an app for a user
   */
  async disconnectApp(appId: number) {
    try {
      return await storage.updateConnectedApp(appId, { connected: false });
    } catch (error) {
      console.error("Error disconnecting app:", error);
      throw error;
    }
  }

  /**
   * Get spending data for all connected apps
   */
  async getAppSpending(userId: number, month: number, year: number): Promise<AppSpending[]> {
    try {
      // Get user's connected apps
      const connectedApps = await storage.getConnectedApps(userId);
      
      // Get transactions for the month
      const transactions = await storage.getTransactionsByMonth(userId, month, year);
      
      // Map transactions to apps based on merchant name
      // This is a simple implementation - in a real app we'd have a more sophisticated
      // way to map transactions to specific apps
      const appSpending: AppSpending[] = [];
      
      for (const app of connectedApps) {
        if (!app.connected) continue;
        
        // Find transactions related to this app
        const appTransactions = transactions.filter(t => {
          const merchant = t.merchant?.toLowerCase() || '';
          const appName = app.appName.toLowerCase();
          return t.type === 'expense' && merchant.includes(appName);
        });
        
        const totalSpent = appTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Only include apps with spending
        if (totalSpent > 0) {
          appSpending.push({
            appId: app.id,
            appName: app.appName,
            appType: app.appType,
            amount: totalSpent,
            month,
            year
          });
        }
      }
      
      return appSpending;
    } catch (error) {
      console.error("Error getting app spending:", error);
      throw error;
    }
  }
}

export const connectedAppsService = new ConnectedAppsService();