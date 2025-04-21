import { z } from "zod";
import { storage } from "../storage";
import { Transaction, Badge } from "@shared/schema";

// Savings challenge type definition
export const savingsChallengeSchema = z.object({
  id: z.number().optional(),
  userId: z.number(),
  title: z.string(),
  description: z.string(),
  targetAmount: z.number(),
  currentAmount: z.number().default(0),
  startDate: z.date(),
  endDate: z.date(),
  isCompleted: z.boolean().default(false),
  badgeId: z.number().optional()
});

export type SavingsChallenge = z.infer<typeof savingsChallengeSchema>;
export type CreateSavingsChallenge = Omit<SavingsChallenge, "id" | "currentAmount" | "isCompleted">;

/**
 * Service for handling gamified savings features
 */
export class GamifiedSavingsService {
  private challenges: Map<number, SavingsChallenge>;
  private challengeIdCounter: number;

  constructor() {
    this.challenges = new Map();
    this.challengeIdCounter = 1;
  }

  /**
   * Create a new savings challenge for a user
   */
  async createChallenge(data: CreateSavingsChallenge): Promise<SavingsChallenge> {
    const id = this.challengeIdCounter++;
    
    const challenge: SavingsChallenge = {
      ...data,
      id,
      currentAmount: 0,
      isCompleted: false
    };
    
    this.challenges.set(id, challenge);
    return challenge;
  }

  /**
   * Get all savings challenges for a user
   */
  async getUserChallenges(userId: number): Promise<SavingsChallenge[]> {
    return Array.from(this.challenges.values())
      .filter(challenge => challenge.userId === userId);
  }

  /**
   * Get active challenges (not completed and not expired)
   */
  async getActiveChallenges(userId: number): Promise<SavingsChallenge[]> {
    const now = new Date();
    return (await this.getUserChallenges(userId))
      .filter(challenge => !challenge.isCompleted && new Date(challenge.endDate) > now);
  }

  /**
   * Add savings amount to a challenge
   */
  async addSavings(challengeId: number, amount: number): Promise<SavingsChallenge | undefined> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return undefined;
    
    const newAmount = challenge.currentAmount + amount;
    const isCompleted = newAmount >= challenge.targetAmount;
    
    // If challenge is completed, award badge
    if (isCompleted && !challenge.isCompleted && challenge.badgeId) {
      const badge = await storage.getBadges(challenge.userId)
        .then(badges => badges.find(b => b.id === challenge.badgeId));
      
      if (badge) {
        await storage.updateBadge(badge.id, { earned: true, earnedDate: new Date() });
      }
    }
    
    const updatedChallenge = {
      ...challenge,
      currentAmount: newAmount,
      isCompleted
    };
    
    this.challenges.set(challengeId, updatedChallenge);
    return updatedChallenge;
  }

  /**
   * Update an existing savings challenge
   */
  async updateChallenge(id: number, data: Partial<SavingsChallenge>): Promise<SavingsChallenge | undefined> {
    const challenge = this.challenges.get(id);
    if (!challenge) return undefined;
    
    const updatedChallenge = {
      ...challenge,
      ...data
    };
    
    this.challenges.set(id, updatedChallenge);
    return updatedChallenge;
  }

  /**
   * Delete a savings challenge
   */
  async deleteChallenge(id: number): Promise<boolean> {
    return this.challenges.delete(id);
  }

  /**
   * Generate a personalized savings suggestion
   */
  async generateSavingsSuggestion(userId: number): Promise<string> {
    const transactions = await storage.getTransactions(userId);
    
    // Group transactions by category
    const categories = new Map<string, number>();
    transactions.forEach(transaction => {
      const current = categories.get(transaction.category) || 0;
      categories.set(transaction.category, current + transaction.amount);
    });
    
    // Find top spending category
    let topCategory = '';
    let topAmount = 0;
    
    categories.forEach((amount, category) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = category;
      }
    });
    
    // Generate suggestion based on top category
    const weeklySuggestion = Math.round(topAmount * 0.1);
    
    const suggestions = [
      `Save ₹${weeklySuggestion} this week by cutting back on ${topCategory} to unlock the "Smart Saver" badge!`,
      `Challenge: Reduce your ${topCategory} spending by 10% this week and save ₹${weeklySuggestion}!`,
      `Ready to level up? Save ₹${weeklySuggestion} from your ${topCategory} budget this week!`,
      `New challenge unlocked: Save ₹${weeklySuggestion} this week and earn bonus points!`
    ];
    
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  /**
   * Setup sample challenges for a user
   */
  setupSampleChallenges(userId: number): void {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Create badges for challenges
    this.createSampleBadges(userId);
    
    // Weekly saving challenge
    this.createChallenge({
      userId,
      title: "Weekly Saver",
      description: "Save ₹1,000 this week by reducing food delivery orders",
      targetAmount: 1000,
      startDate: now,
      endDate: oneWeekFromNow,
      badgeId: 1
    });
    
    // Coffee skipping challenge
    this.createChallenge({
      userId,
      title: "Coffee Skipper",
      description: "Skip your daily fancy coffee 3 times this week to save ₹600",
      targetAmount: 600,
      startDate: now,
      endDate: oneWeekFromNow,
      badgeId: 2
    });
    
    // Shopping freeze challenge
    this.createChallenge({
      userId,
      title: "Shopping Freeze",
      description: "No online shopping for two weeks to save ₹3,000",
      targetAmount: 3000,
      startDate: now,
      endDate: twoWeeksFromNow,
      badgeId: 3
    });
    
    // Monthly savings challenge
    this.createChallenge({
      userId,
      title: "Emergency Fund Builder",
      description: "Build your emergency fund by saving ₹5,000 this month",
      targetAmount: 5000,
      startDate: now,
      endDate: oneMonthFromNow,
      badgeId: 4
    });
  }

  /**
   * Create sample badges for challenges
   */
  private async createSampleBadges(userId: number): Promise<void> {
    const badges = [
      {
        userId,
        name: "Weekly Warrior",
        description: "Completed a weekly savings challenge",
        icon: "trophy",
        earned: false,
        earnedDate: null
      },
      {
        userId,
        name: "Coffee Conqueror",
        description: "Saved money by skipping expensive coffee",
        icon: "coffee",
        earned: false,
        earnedDate: null
      },
      {
        userId,
        name: "Shopping Stopper",
        description: "Completed a shopping freeze challenge",
        icon: "shopping-bag",
        earned: false,
        earnedDate: null
      },
      {
        userId,
        name: "Emergency Master",
        description: "Built up your emergency fund",
        icon: "shield",
        earned: false,
        earnedDate: null
      }
    ];
    
    for (const badge of badges) {
      await storage.createBadge(badge);
    }
  }
}

export const gamifiedSavingsService = new GamifiedSavingsService();

// Initialize with sample data
gamifiedSavingsService.setupSampleChallenges(1);