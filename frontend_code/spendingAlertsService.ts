import { z } from "zod";
import { storage } from "../storage";
import { Transaction } from "@shared/schema";

// Spending alert type definition
export const spendingAlertSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  category: z.string(),
  threshold: z.number(),
  timePeriod: z.enum(["daily", "weekly", "monthly"]),
  message: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional()
});

export type SpendingAlert = z.infer<typeof spendingAlertSchema>;
export type CreateSpendingAlert = Omit<SpendingAlert, "id" | "createdAt">;

/**
 * Service for handling spending alerts and notifications
 */
export class SpendingAlertsService {
  private alerts: Map<number, SpendingAlert>;
  private alertIdCounter: number;

  constructor() {
    this.alerts = new Map();
    this.alertIdCounter = 1;
  }

  /**
   * Create a new spending alert for a user
   */
  async createAlert(data: CreateSpendingAlert): Promise<SpendingAlert> {
    const id = this.alertIdCounter++;
    const now = new Date();
    
    const alert: SpendingAlert = {
      ...data,
      id,
      createdAt: now,
      message: data.message || this.generateDefaultMessage(data.category, data.threshold, data.timePeriod)
    };
    
    this.alerts.set(id, alert);
    return alert;
  }

  /**
   * Get all spending alerts for a user
   */
  async getUserAlerts(userId: number): Promise<SpendingAlert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId);
  }

  /**
   * Update an existing spending alert
   */
  async updateAlert(id: number, data: Partial<SpendingAlert>): Promise<SpendingAlert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = {
      ...alert,
      ...data,
      message: data.message || 
        (data.category || data.threshold || data.timePeriod ? 
          this.generateDefaultMessage(
            data.category || alert.category, 
            data.threshold || alert.threshold, 
            data.timePeriod || alert.timePeriod
          ) : alert.message)
    };
    
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  /**
   * Delete a spending alert
   */
  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
  }

  /**
   * Check if a user has exceeded their spending threshold for any active alerts
   * Returns triggered alerts with the amount spent
   */
  async checkAlerts(userId: number): Promise<{ alert: SpendingAlert, amountSpent: number }[]> {
    const userAlerts = await this.getUserAlerts(userId);
    const activeAlerts = userAlerts.filter(alert => alert.isActive);
    const now = new Date();
    const triggered = [];

    // Get user transactions
    const transactions = await storage.getTransactions(userId);

    for (const alert of activeAlerts) {
      const { timePeriod, category, threshold } = alert;
      
      // Filter transactions by time period
      const filteredTransactions = this.filterTransactionsByTimePeriod(transactions, timePeriod, now);
      
      // Filter transactions by category
      const categoryTransactions = filteredTransactions.filter(t => 
        t.category.toLowerCase() === category.toLowerCase()
      );
      
      // Calculate total amount spent
      const amountSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      // Check if threshold is exceeded
      if (amountSpent > threshold) {
        triggered.push({ alert, amountSpent });
      }
    }

    return triggered;
  }

  /**
   * Generate a personalized spending alert notification
   */
  async generateNotification(alertWithAmount: { alert: SpendingAlert, amountSpent: number }): Promise<string> {
    const { alert, amountSpent } = alertWithAmount;
    const { category, threshold, timePeriod, message } = alert;
    
    if (message) return message
      .replace('{amount}', amountSpent.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }))
      .replace('{threshold}', threshold.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }))
      .replace('{category}', category)
      .replace('{period}', timePeriod);
    
    return this.generateDefaultMessage(category, amountSpent, timePeriod);
  }

  /**
   * Filter transactions based on time period (daily, weekly, monthly)
   */
  private filterTransactionsByTimePeriod(
    transactions: Transaction[], 
    timePeriod: "daily" | "weekly" | "monthly", 
    currentDate: Date
  ): Transaction[] {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const diffTime = currentDate.getTime() - transactionDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (timePeriod) {
        case "daily":
          return diffDays <= 1;
        case "weekly":
          return diffDays <= 7;
        case "monthly":
          return (
            transactionDate.getMonth() === currentDate.getMonth() && 
            transactionDate.getFullYear() === currentDate.getFullYear()
          );
        default:
          return false;
      }
    });
  }

  /**
   * Generate a default message for an alert
   */
  private generateDefaultMessage(
    category: string, 
    amount: number, 
    timePeriod: "daily" | "weekly" | "monthly"
  ): string {
    const formattedAmount = amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    
    const messages = [
      `You've spent ${formattedAmount} on ${category} this ${timePeriod}!`,
      `Heads up! Your ${category} spending has reached ${formattedAmount} this ${timePeriod}.`,
      `Alert: You've spent ${formattedAmount} on ${category} this ${timePeriod}. That's above your target!`,
      `Your ${timePeriod} ${category} spending is now at ${formattedAmount}. Do you want to slow down?`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Setup sample alerts for testing
   */
  setupSampleAlerts(userId: number): void {
    this.createAlert({
      userId,
      category: "food",
      threshold: 2000,
      timePeriod: "weekly",
      message: "You've spent ₹{amount} on food this week, which is above your ₹{threshold} target!",
      isActive: true
    });
    
    this.createAlert({
      userId,
      category: "shopping",
      threshold: 5000,
      timePeriod: "monthly",
      message: "Your monthly shopping spree has reached ₹{amount}! That's over your ₹{threshold} budget.",
      isActive: true
    });
    
    this.createAlert({
      userId,
      category: "entertainment",
      threshold: 1000,
      timePeriod: "weekly",
      message: "Entertainment expenses this week: ₹{amount}. Your limit is ₹{threshold}.",
      isActive: true
    });
  }
}

export const spendingAlertsService = new SpendingAlertsService();

// Initialize with sample data
spendingAlertsService.setupSampleAlerts(1);