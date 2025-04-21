import { storage } from "../storage";
import { Transaction } from "@shared/schema";

interface SpendingPredict {
  category: string;
  predictedAmount: number;
  confidence: number;
}

interface SpendingPattern {
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  averageAmount: number;
  isNecessity: boolean;
  savingsPotential: number;
}

interface SpendingClassification {
  totalSpending: number;
  necessities: number;
  wants: number;
  savings: number;
  topCategories: Array<{category: string, amount: number, percentage: number}>;
  patterns: SpendingPattern[];
  nextMonthPredictions: SpendingPredict[];
}

/**
 * Service that uses ML techniques to classify spending and generate predictions
 * 
 * Note: This is a simulation of what would normally be a TensorFlow or PyTorch model
 * In a production environment, this would use actual ML models for:
 * 1. Transaction categorization
 * 2. Necessity vs. wants classification
 * 3. Spending pattern detection
 * 4. Future spending predictions
 */
export class AISpendingClassifierService {
  // Dictionary of categories and their necessity classification
  private categoryClassification: Record<string, boolean> = {
    'rent': true,
    'mortgage': true,
    'utilities': true,
    'groceries': true,
    'healthcare': true,
    'insurance': true,
    'transportation': true,
    'education': true,
    'childcare': true,
    'dining': false,
    'entertainment': false,
    'shopping': false,
    'travel': false,
    'gifts': false,
    'subscriptions': false,
    'beauty': false,
    'clothing': false,
    'electronics': false,
    'hobbies': false,
    'food': true,
    'savings': true,
    'investment': true
  };

  /**
   * Analyze user's spending habits and classify transactions
   */
  async classifySpending(userId: number, month: number, year: number): Promise<SpendingClassification> {
    // Get transactions for the specified month
    const transactions = await storage.getTransactionsByMonth(userId, month, year);
    
    // Calculate total spending
    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Categorize transactions
    const categorized = this.categorizeTransactions(transactions);
    
    // Classify into needs vs. wants
    const { necessities, wants, savings } = this.classifyNecessitiesAndWants(categorized);
    
    // Generate top categories
    const topCategories = this.generateTopCategories(categorized, totalSpending);
    
    // Identify spending patterns
    const patterns = this.identifySpendingPatterns(categorized, transactions);
    
    // Generate predictions for next month
    const nextMonthPredictions = this.predictNextMonthSpending(categorized, transactions);
    
    return {
      totalSpending,
      necessities,
      wants,
      savings,
      topCategories,
      patterns,
      nextMonthPredictions
    };
  }

  /**
   * Categorize transactions by spending category
   */
  private categorizeTransactions(transactions: Transaction[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category.toLowerCase();
      categories[category] = (categories[category] || 0) + transaction.amount;
    });
    
    return categories;
  }

  /**
   * Classify spending into necessities, wants, and savings
   */
  private classifyNecessitiesAndWants(categorized: Record<string, number>): { necessities: number, wants: number, savings: number } {
    let necessities = 0;
    let wants = 0;
    let savings = 0;
    
    Object.entries(categorized).forEach(([category, amount]) => {
      const lowerCategory = category.toLowerCase();
      
      if (lowerCategory === 'savings' || lowerCategory === 'investment') {
        savings += amount;
      } else if (this.categoryClassification[lowerCategory] || this.isNecessity(lowerCategory)) {
        necessities += amount;
      } else {
        wants += amount;
      }
    });
    
    return { necessities, wants, savings };
  }

  /**
   * Determine if a category is a necessity based on keywords
   */
  private isNecessity(category: string): boolean {
    const necessityKeywords = ['bill', 'utility', 'rent', 'food', 'grocery', 'health', 'medical', 'transport'];
    return necessityKeywords.some(keyword => category.includes(keyword));
  }

  /**
   * Generate top spending categories with percentages
   */
  private generateTopCategories(
    categorized: Record<string, number>, 
    totalSpending: number
  ): Array<{category: string, amount: number, percentage: number}> {
    return Object.entries(categorized)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 categories
  }

  /**
   * Identify spending patterns in user transactions
   */
  private identifySpendingPatterns(
    categorized: Record<string, number>,
    transactions: Transaction[]
  ): SpendingPattern[] {
    const patterns: SpendingPattern[] = [];
    const now = new Date();
    
    // Group transactions by date and category to find patterns
    const categoryTransactionMap: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category.toLowerCase();
      if (!categoryTransactionMap[category]) {
        categoryTransactionMap[category] = [];
      }
      categoryTransactionMap[category].push(transaction);
    });
    
    // Analyze each category for patterns
    Object.entries(categoryTransactionMap).forEach(([category, categoryTransactions]) => {
      if (categoryTransactions.length < 2) return; // Need at least 2 transactions to identify a pattern
      
      // Sort by date
      categoryTransactions.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Calculate average time between transactions
      let totalDays = 0;
      for (let i = 1; i < categoryTransactions.length; i++) {
        const daysDiff = Math.round(
          (new Date(categoryTransactions[i].date).getTime() - new Date(categoryTransactions[i-1].date).getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        totalDays += daysDiff;
      }
      
      const avgDays = totalDays / (categoryTransactions.length - 1);
      
      // Determine frequency
      let frequency: 'daily' | 'weekly' | 'monthly';
      if (avgDays <= 2) {
        frequency = 'daily';
      } else if (avgDays <= 10) {
        frequency = 'weekly';
      } else {
        frequency = 'monthly';
      }
      
      // Calculate average amount
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = totalAmount / categoryTransactions.length;
      
      // Determine if it's a necessity
      const isNecessity = this.categoryClassification[category] || this.isNecessity(category);
      
      // Calculate savings potential (higher for wants, lower for necessities)
      const savingsPotential = isNecessity 
        ? averageAmount * 0.05 // 5% potential savings on necessities
        : averageAmount * 0.25; // 25% potential savings on wants
      
      patterns.push({
        category,
        frequency,
        averageAmount,
        isNecessity,
        savingsPotential: Math.round(savingsPotential)
      });
    });
    
    // Sort by savings potential (highest first)
    return patterns.sort((a, b) => b.savingsPotential - a.savingsPotential);
  }

  /**
   * Predict next month's spending based on historical data
   */
  private predictNextMonthSpending(
    categorized: Record<string, number>,
    transactions: Transaction[]
  ): SpendingPredict[] {
    const predictions: SpendingPredict[] = [];
    
    // For categories with enough data, make predictions
    Object.entries(categorized).forEach(([category, amount]) => {
      const categoryTransactions = transactions.filter(
        t => t.category.toLowerCase() === category.toLowerCase()
      );
      
      if (categoryTransactions.length === 0) return;
      
      // Add small random variance to simulate prediction
      const variance = Math.random() * 0.2 - 0.1; // -10% to +10%
      const predictedAmount = amount * (1 + variance);
      
      // Confidence based on number of transactions
      const confidenceBase = Math.min(categoryTransactions.length / 10, 0.9);
      const confidence = confidenceBase + Math.random() * 0.1; // Add a small randomness
      
      predictions.push({
        category,
        predictedAmount: Math.round(predictedAmount),
        confidence: Number(confidence.toFixed(2))
      });
    });
    
    // Sort by predicted amount (highest first)
    return predictions
      .sort((a, b) => b.predictedAmount - a.predictedAmount)
      .slice(0, 5); // Top 5 predictions
  }
}

export const aiSpendingClassifierService = new AISpendingClassifierService();