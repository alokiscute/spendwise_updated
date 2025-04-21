import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema, 
  insertGoalSchema, 
  insertBudgetSettingsSchema,
  insertConnectedAppSchema
} from "@shared/schema";
import { setupAuth } from "./auth";
import { connectedAppsService } from "./services/connectedAppsService";
import { aiInsightService } from "./services/aiInsightService";
import { spendingAlertsService } from "./services/spendingAlertsService";
import { gamifiedSavingsService } from "./services/gamifiedSavingsService";
import { aiSpendingClassifierService } from "./services/aiSpendingClassifierService";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up authentication
  setupAuth(app);
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const transactions = await storage.getTransactions(user.id);
    res.json(transactions);
  });
  
  app.get("/api/transactions/month/:month/year/:year", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);
    
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ message: "Invalid month or year" });
    }
    
    const transactions = await storage.getTransactionsByMonth(user.id, month, year);
    res.json(transactions);
  });
  
  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const newTransaction = await storage.createTransaction(transactionData);
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  app.post("/api/transactions/batch", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { transactions } = req.body;
      
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ message: "Invalid transactions data. Expected non-empty array." });
      }
      
      // Validate and process each transaction
      const processedTransactions = [];
      for (const transaction of transactions) {
        try {
          const transactionData = insertTransactionSchema.parse({
            ...transaction,
            userId: user.id
          });
          
          const newTransaction = await storage.createTransaction(transactionData);
          processedTransactions.push(newTransaction);
        } catch (parseError) {
          console.error("Error processing transaction:", parseError);
          // Continue with the next transaction even if this one failed
        }
      }
      
      res.status(201).json({ 
        message: "Transactions imported successfully", 
        count: processedTransactions.length 
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  // Goals routes
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const goals = await storage.getGoals(user.id);
    res.json(goals);
  });
  
  app.get("/api/goals/:id", isAuthenticated, async (req, res) => {
    const goalId = parseInt(req.params.id, 10);
    
    if (isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    
    const goal = await storage.getGoal(goalId);
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    // Check if goal belongs to user
    const user = req.user as any;
    if (goal.userId !== user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(goal);
  });
  
  app.post("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const newGoal = await storage.createGoal(goalData);
      res.status(201).json(newGoal);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  app.patch("/api/goals/:id", isAuthenticated, async (req, res) => {
    const goalId = parseInt(req.params.id, 10);
    
    if (isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    
    const goal = await storage.getGoal(goalId);
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    // Check if goal belongs to user
    const user = req.user as any;
    if (goal.userId !== user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    try {
      const updatedGoal = await storage.updateGoal(goalId, req.body);
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  // Budget routes
  app.get("/api/budget", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const budget = await storage.getBudgetSettings(user.id);
    
    if (!budget) {
      return res.status(404).json({ message: "Budget settings not found" });
    }
    
    res.json(budget);
  });
  
  app.post("/api/budget", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Check if budget already exists
      const existingBudget = await storage.getBudgetSettings(user.id);
      if (existingBudget) {
        return res.status(400).json({ message: "Budget settings already exist" });
      }
      
      const budgetData = insertBudgetSettingsSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const newBudget = await storage.createBudgetSettings(budgetData);
      res.status(201).json(newBudget);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  app.patch("/api/budget", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const updatedBudget = await storage.updateBudgetSettings(user.id, req.body);
      
      if (!updatedBudget) {
        return res.status(404).json({ message: "Budget settings not found" });
      }
      
      res.json(updatedBudget);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  // Badges routes
  app.get("/api/badges", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const badges = await storage.getBadges(user.id);
    res.json(badges);
  });
  
  // Connected Apps routes
  app.get("/api/connected-apps", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const apps = await storage.getConnectedApps(user.id);
    res.json(apps);
  });
  
  app.post("/api/connected-apps", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const appData = insertConnectedAppSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const newApp = await storage.createConnectedApp(appData);
      res.status(201).json(newApp);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  app.patch("/api/connected-apps/:id", isAuthenticated, async (req, res) => {
    const appId = parseInt(req.params.id, 10);
    
    if (isNaN(appId)) {
      return res.status(400).json({ message: "Invalid app ID" });
    }
    
    try {
      const updatedApp = await storage.updateConnectedApp(appId, req.body);
      
      if (!updatedApp) {
        return res.status(404).json({ message: "Connected app not found" });
      }
      
      res.json(updatedApp);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  // Connect app using service
  app.post("/api/connected-apps/connect", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const newApp = await connectedAppsService.connectApp(user.id, req.body);
      res.status(201).json(newApp);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  // Disconnect app
  app.post("/api/connected-apps/:id/disconnect", isAuthenticated, async (req, res) => {
    const appId = parseInt(req.params.id, 10);
    
    if (isNaN(appId)) {
      return res.status(400).json({ message: "Invalid app ID" });
    }
    
    try {
      const updatedApp = await connectedAppsService.disconnectApp(appId);
      
      if (!updatedApp) {
        return res.status(404).json({ message: "Connected app not found" });
      }
      
      res.json(updatedApp);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });
  
  // Get app spending data
  app.get("/api/connected-apps/spending/:month/:year", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);
    
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ message: "Invalid month or year" });
    }
    
    try {
      const spendingData = await connectedAppsService.getAppSpending(user.id, month, year);
      res.json(spendingData);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An error occurred" });
      }
    }
  });
  
  // Insights routes - for Money Wrapped
  app.get("/api/insights/month/:month/year/:year", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);
    
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ message: "Invalid month or year" });
    }
    
    // Get transactions for the month
    const transactions = await storage.getTransactionsByMonth(user.id, month, year);
    
    // Calculate total spending by category
    const spendingByCategory: Record<string, number> = {};
    const merchantCounts: Record<string, number> = {};
    let totalSpending = 0;
    let totalSaving = 0;
    let biggestSpend = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        // Add to category total
        if (!spendingByCategory[transaction.category]) {
          spendingByCategory[transaction.category] = 0;
        }
        spendingByCategory[transaction.category] += transaction.amount;
        
        // Count merchant occurrences
        if (transaction.merchant) {
          if (!merchantCounts[transaction.merchant]) {
            merchantCounts[transaction.merchant] = 0;
          }
          merchantCounts[transaction.merchant] += 1;
        }
        
        // Update total spending
        totalSpending += transaction.amount;
        
        // Update biggest spend
        if (transaction.amount > biggestSpend) {
          biggestSpend = transaction.amount;
        }
      }
    });
    
    // Get all goals and calculate savings
    const goals = await storage.getGoals(user.id);
    goals.forEach(goal => {
      if (goal.currentAmount > 0) {
        totalSaving += goal.currentAmount;
      }
    });
    
    // Find top spending category
    let topCategory = '';
    let topAmount = 0;
    
    Object.entries(spendingByCategory).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topCategory = category;
        topAmount = amount;
      }
    });
    
    // Find most visited merchant
    let topMerchant = '';
    let topCount = 0;
    
    Object.entries(merchantCounts).forEach(([merchant, count]) => {
      if (count > topCount) {
        topMerchant = merchant;
        topCount = count;
      }
    });
    
    // Prepare response
    const insights = {
      spendingByCategory,
      topCategory,
      topAmount,
      totalSpending,
      totalSaving,
      topMerchant,
      topCount,
      biggestSpend,
      transactionCount: transactions.filter(t => t.type === 'expense').length,
    };
    
    res.json(insights);
  });

  // AI Spending Analysis route
  app.post("/api/ai/analyze-spending", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { month, year } = req.body;
      
      if (!month || !year) {
        return res.status(400).json({ message: "Month and year are required" });
      }
      
      // Get transactions for the specified period
      const transactions = await storage.getTransactionsByMonth(user.id, month, year);
      
      // Prepare the analysis data
      const wantsTransactions = transactions.filter(t => t.isWant === true);
      const needsTransactions = transactions.filter(t => t.isWant === false);
      
      const wantsTotal = wantsTransactions.reduce((sum, t) => sum + t.amount, 0);
      const needsTotal = needsTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalSpending = wantsTotal + needsTotal;
      
      // Categorize spending by category
      const categorySpending: Record<string, { total: number, wants: number, needs: number }> = {};
      
      transactions.forEach(t => {
        if (!categorySpending[t.category]) {
          categorySpending[t.category] = { total: 0, wants: 0, needs: 0 };
        }
        
        categorySpending[t.category].total += t.amount;
        
        if (t.isWant) {
          categorySpending[t.category].wants += t.amount;
        } else {
          categorySpending[t.category].needs += t.amount;
        }
      });
      
      // Get all goals to calculate savings
      const goals = await storage.getGoals(user.id);
      const totalSavings = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
      
      // Prepare and send the analysis
      const analysis = {
        totalSpending,
        wantsTotal,
        needsTotal,
        wantsPercentage: totalSpending > 0 ? (wantsTotal / totalSpending) * 100 : 0,
        needsPercentage: totalSpending > 0 ? (needsTotal / totalSpending) * 100 : 0,
        categoryBreakdown: categorySpending,
        savingsTotal: totalSavings,
        savingsPercentage: totalSpending + totalSavings > 0 ? 
          (totalSavings / (totalSpending + totalSavings)) * 100 : 0,
        transactionCount: transactions.length,
        period: { month, year }
      };
      
      res.json(analysis);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An error occurred during analysis" });
      }
    }
  });
  
  // ML-powered personalized spending insights
  app.get("/api/ai/insights/month/:month/year/:year", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const month = parseInt(req.params.month, 10);
      const year = parseInt(req.params.year, 10);
      
      if (isNaN(month) || isNaN(year)) {
        return res.status(400).json({ message: "Invalid month or year" });
      }
      
      // Get user data needed for insights
      const transactions = await storage.getTransactionsByMonth(user.id, month, year);
      const goals = await storage.getGoals(user.id);
      const budget = await storage.getBudgetSettings(user.id);
      
      if (!budget) {
        return res.status(400).json({ message: "Budget settings not found, required for insights" });
      }
      
      // Format goals for analysis
      const goalsForAnalysis = goals.map(goal => ({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount || 0
      }));
      
      // Generate AI insights
      const insights = await aiInsightService.generateSpendingInsights(
        transactions,
        goalsForAnalysis,
        budget.monthlyBudget
      );
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating ML insights:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An error occurred while generating insights" });
      }
    }
  });
  
  // ML-powered financial advice
  app.post("/api/ai/advice", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ message: "Question is required" });
      }
      
      // Get user data needed for personalized advice
      const transactions = await storage.getTransactions(user.id);
      const goals = await storage.getGoals(user.id);
      
      // Format goals for analysis
      const goalsForAnalysis = goals.map(goal => ({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount || 0
      }));
      
      // Generate personalized advice
      const advice = await aiInsightService.getPersonalizedAdvice(
        question,
        transactions,
        goalsForAnalysis
      );
      
      res.json({ advice });
    } catch (error) {
      console.error("Error generating AI advice:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An error occurred while generating advice" });
      }
    }
  });

  // Spending Alerts routes
  app.get("/api/spending-alerts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const alerts = await spendingAlertsService.getUserAlerts(user.id);
      res.json(alerts);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve spending alerts" });
      }
    }
  });

  app.post("/api/spending-alerts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const alertData = {
        ...req.body,
        userId: user.id
      };
      const newAlert = await spendingAlertsService.createAlert(alertData);
      res.status(201).json(newAlert);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });

  app.patch("/api/spending-alerts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }

      const updatedAlert = await spendingAlertsService.updateAlert(id, req.body);
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }

      res.json(updatedAlert);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });

  app.delete("/api/spending-alerts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }

      const success = await spendingAlertsService.deleteAlert(id);
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to delete alert" });
      }
    }
  });

  app.get("/api/spending-alerts/check", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const triggeredAlerts = await spendingAlertsService.checkAlerts(user.id);
      
      // Generate notifications for each triggered alert
      const notifications = await Promise.all(
        triggeredAlerts.map(async (alert) => ({
          alert: alert.alert,
          amountSpent: alert.amountSpent,
          message: await spendingAlertsService.generateNotification(alert)
        }))
      );

      res.json(notifications);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to check alerts" });
      }
    }
  });

  // Gamified Savings routes
  app.get("/api/savings-challenges", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const challenges = await gamifiedSavingsService.getUserChallenges(user.id);
      res.json(challenges);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve savings challenges" });
      }
    }
  });

  app.get("/api/savings-challenges/active", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const challenges = await gamifiedSavingsService.getActiveChallenges(user.id);
      res.json(challenges);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve active challenges" });
      }
    }
  });

  app.post("/api/savings-challenges", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const challengeData = {
        ...req.body,
        userId: user.id
      };
      const newChallenge = await gamifiedSavingsService.createChallenge(challengeData);
      res.status(201).json(newChallenge);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });

  app.post("/api/savings-challenges/:id/add-savings", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      const { amount } = req.body;
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      const updatedChallenge = await gamifiedSavingsService.addSavings(id, amount);
      if (!updatedChallenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      res.json(updatedChallenge);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid data" });
      }
    }
  });

  app.get("/api/savings-suggestion", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const suggestion = await gamifiedSavingsService.generateSavingsSuggestion(user.id);
      res.json({ suggestion });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to generate savings suggestion" });
      }
    }
  });

  // AI Spending Classification routes
  app.get("/api/ai/spending-classification/:month/:year", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const month = parseInt(req.params.month, 10);
      const year = parseInt(req.params.year, 10);
      
      if (isNaN(month) || isNaN(year)) {
        return res.status(400).json({ message: "Invalid month or year" });
      }
      
      const spendingClassification = await aiSpendingClassifierService.classifySpending(
        user.id, 
        month,
        year
      );
      
      res.json(spendingClassification);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to classify spending" });
      }
    }
  });

  // Integration with external payment gateways (Razorpay, Plaid, etc.)
  // Note: These are placeholder routes that would be implemented with
  // actual API credentials in production
  
  // Razorpay integration
  app.post("/api/razorpay/create-order", isAuthenticated, async (req, res) => {
    try {
      const { amount, currency = "INR", receipt, notes } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      // In a real implementation, this would call the Razorpay API
      // using the Razorpay Node.js SDK and proper credentials
      
      // Simulated response for development
      const order = {
        id: `order_${Date.now()}`,
        entity: "order",
        amount,
        amount_paid: 0,
        amount_due: amount,
        currency,
        receipt,
        status: "created",
        attempts: 0,
        notes,
        created_at: new Date()
      };
      
      res.json(order);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create Razorpay order" });
      }
    }
  });
  
  // Plaid integration
  app.post("/api/plaid/create-link-token", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // In a real implementation, this would call the Plaid API
      // using the Plaid Node.js SDK and proper credentials
      
      // Simulated response for development
      const linkToken = {
        link_token: `link-sandbox-${user.id}-${Date.now()}`,
        expiration: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        request_id: `request-${Date.now()}`
      };
      
      res.json(linkToken);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create Plaid link token" });
      }
    }
  });
  
  app.post("/api/plaid/exchange-public-token", isAuthenticated, async (req, res) => {
    try {
      const { public_token } = req.body;
      
      if (!public_token) {
        return res.status(400).json({ message: "Public token is required" });
      }
      
      // In a real implementation, this would call the Plaid API
      // to exchange the public token for an access token
      
      // Simulated response for development
      const exchangeResponse = {
        access_token: `access-sandbox-${Date.now()}`,
        item_id: `item-sandbox-${Date.now()}`,
        request_id: `request-${Date.now()}`
      };
      
      res.json({ success: true, ...exchangeResponse });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to exchange Plaid token" });
      }
    }
  });

  return httpServer;
}
