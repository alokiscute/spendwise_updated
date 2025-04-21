import { 
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  goals, type Goal, type InsertGoal,
  badges, type Badge, type InsertBadge,
  budgetSettings, type BudgetSetting, type InsertBudgetSetting,
  connectedApps, type ConnectedApp, type InsertConnectedApp
} from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import { eq, and, between, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionsByMonth(userId: number, month: number, year: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Goal operations
  getGoals(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | undefined>;
  
  // Badge operations
  getBadges(userId: number): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  updateBadge(id: number, badge: Partial<Badge>): Promise<Badge | undefined>;
  
  // Budget operations
  getBudgetSettings(userId: number): Promise<BudgetSetting | undefined>;
  createBudgetSettings(budget: InsertBudgetSetting): Promise<BudgetSetting>;
  updateBudgetSettings(userId: number, budget: Partial<BudgetSetting>): Promise<BudgetSetting | undefined>;
  
  // Connected Apps operations
  getConnectedApps(userId: number): Promise<ConnectedApp[]>;
  createConnectedApp(app: InsertConnectedApp): Promise<ConnectedApp>;
  updateConnectedApp(id: number, app: Partial<ConnectedApp>): Promise<ConnectedApp | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    // Set up PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser, 
      nickname: insertUser.nickname || null,
      avatarType: insertUser.avatarType || null,
      ageRange: insertUser.ageRange || null,
      createdAt: new Date()
    }).returning();
    return user;
  }
  
  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }
  
  async getTransactionsByMonth(userId: number, month: number, year: number): Promise<Transaction[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          between(transactions.date, startDate, endDate)
        )
      )
      .orderBy(desc(transactions.date));
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values({
      ...insertTransaction,
      date: insertTransaction.date || new Date(),
      isWant: insertTransaction.isWant || null,
      merchant: insertTransaction.merchant || null
    }).returning();
    return transaction;
  }
  
  // Goal operations
  async getGoals(userId: number): Promise<Goal[]> {
    const userGoals = await db.select()
      .from(goals)
      .where(eq(goals.userId, userId));
    
    // Sort primary goals first, then by name
    return userGoals.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.name.localeCompare(b.name);
    });
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    // If this is set as primary goal, update existing primary goals
    if (insertGoal.isPrimary) {
      await db.update(goals)
        .set({ isPrimary: false })
        .where(
          and(
            eq(goals.userId, insertGoal.userId),
            eq(goals.isPrimary, true)
          )
        );
    }
    
    const [goal] = await db.insert(goals).values({
      ...insertGoal,
      emoji: insertGoal.emoji || null,
      currentAmount: insertGoal.currentAmount || 0,
      completed: insertGoal.completed || false,
      isPrimary: insertGoal.isPrimary || false
    }).returning();
    
    return goal;
  }
  
  async updateGoal(id: number, goalUpdate: Partial<Goal>): Promise<Goal | undefined> {
    // If setting as primary, update other goals
    if (goalUpdate.isPrimary === true) {
      const [goal] = await db.select().from(goals).where(eq(goals.id, id));
      if (goal) {
        await db.update(goals)
          .set({ isPrimary: false })
          .where(
            and(
              eq(goals.userId, goal.userId),
              eq(goals.isPrimary, true),
              eq(goals.id, id)
            )
          );
      }
    }
    
    const [updatedGoal] = await db.update(goals)
      .set(goalUpdate)
      .where(eq(goals.id, id))
      .returning();
      
    return updatedGoal || undefined;
  }
  
  // Badge operations
  async getBadges(userId: number): Promise<Badge[]> {
    const userBadges = await db.select()
      .from(badges)
      .where(eq(badges.userId, userId));
    
    // Sort earned badges first
    return userBadges.sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      
      if (a.earned && b.earned && a.earnedDate && b.earnedDate) {
        return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime();
      }
      
      return a.name.localeCompare(b.name);
    });
  }
  
  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db.insert(badges).values({
      ...insertBadge,
      earned: insertBadge.earned || false,
      earnedDate: insertBadge.earnedDate || null
    }).returning();
    
    return badge;
  }
  
  async updateBadge(id: number, badgeUpdate: Partial<Badge>): Promise<Badge | undefined> {
    const [updatedBadge] = await db.update(badges)
      .set(badgeUpdate)
      .where(eq(badges.id, id))
      .returning();
      
    return updatedBadge || undefined;
  }
  
  // Budget operations
  async getBudgetSettings(userId: number): Promise<BudgetSetting | undefined> {
    const [budget] = await db.select()
      .from(budgetSettings)
      .where(eq(budgetSettings.userId, userId));
      
    return budget || undefined;
  }
  
  async createBudgetSettings(insertBudget: InsertBudgetSetting): Promise<BudgetSetting> {
    const [budget] = await db.insert(budgetSettings).values({
      ...insertBudget,
      essentialsPercentage: insertBudget.essentialsPercentage || 0,
      foodPercentage: insertBudget.foodPercentage || 0,
      funPercentage: insertBudget.funPercentage || 0,
      treatsPercentage: insertBudget.treatsPercentage || 0
    }).returning();
    
    return budget;
  }
  
  async updateBudgetSettings(userId: number, budgetUpdate: Partial<BudgetSetting>): Promise<BudgetSetting | undefined> {
    const [updatedBudget] = await db.update(budgetSettings)
      .set(budgetUpdate)
      .where(eq(budgetSettings.userId, userId))
      .returning();
      
    return updatedBudget || undefined;
  }
  
  // Connected Apps operations
  async getConnectedApps(userId: number): Promise<ConnectedApp[]> {
    const userApps = await db.select()
      .from(connectedApps)
      .where(eq(connectedApps.userId, userId));
    
    // Sort by app name
    return userApps.sort((a, b) => a.appName.localeCompare(b.appName));
  }
  
  async createConnectedApp(insertApp: InsertConnectedApp): Promise<ConnectedApp> {
    const [app] = await db.insert(connectedApps).values({
      ...insertApp,
      connected: insertApp.connected || false
    }).returning();
    
    return app;
  }
  
  async updateConnectedApp(id: number, appUpdate: Partial<ConnectedApp>): Promise<ConnectedApp | undefined> {
    const [updatedApp] = await db.update(connectedApps)
      .set(appUpdate)
      .where(eq(connectedApps.id, id))
      .returning();
      
    return updatedApp || undefined;
  }
}

// Create MemStorage as a fallback (for development/testing)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private goals: Map<number, Goal>;
  private badges: Map<number, Badge>;
  private budgetSettings: Map<number, BudgetSetting>;
  private connectedApps: Map<number, ConnectedApp>;
  
  private userIdCounter: number;
  private transactionIdCounter: number;
  private goalIdCounter: number;
  private badgeIdCounter: number;
  private budgetIdCounter: number;
  private appIdCounter: number;
  
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.goals = new Map();
    this.badges = new Map();
    this.budgetSettings = new Map();
    this.connectedApps = new Map();
    
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.goalIdCounter = 1;
    this.badgeIdCounter = 1;
    this.budgetIdCounter = 1;
    this.appIdCounter = 1;
    
    // Initialize memory store for sessions
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with sample data for demo purposes
    this.setupSampleData();
  }
  
  private setupSampleData() {
    // Add a sample user
    const sampleUser: InsertUser = {
      username: "demo@example.com",
      password: "password123", // In a real app, this would be hashed
      nickname: "Aman",
      avatarType: "funny",
      ageRange: "18-24",
    };
    this.createUser(sampleUser);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      nickname: insertUser.nickname || null,
      avatarType: insertUser.avatarType || null,
      ageRange: insertUser.ageRange || null,
      createdAt: now 
    };
    this.users.set(id, user);
    
    // Create sample goals for new user
    this.createGoal({
      userId: id,
      name: "New Headphones",
      emoji: "🎧",
      targetAmount: 12000,
      currentAmount: 3000,
      completed: false,
      isPrimary: true,
    });
    
    this.createGoal({
      userId: id,
      name: "Trip Fund",
      emoji: "✈️",
      targetAmount: 50000,
      currentAmount: 5000,
      completed: false,
      isPrimary: false,
    });
    
    this.createGoal({
      userId: id,
      name: "Impulse Control",
      emoji: "💸",
      targetAmount: 0,
      currentAmount: 0,
      completed: false,
      isPrimary: false,
    });
    
    // Create sample badges
    this.createBadge({
      userId: id,
      name: "Budget Bae",
      description: "Stayed under monthly goal",
      icon: "ri-money-dollar-circle-line",
      earned: true,
      earnedDate: new Date(),
    });
    
    this.createBadge({
      userId: id,
      name: "Zomato Zen",
      description: "No food delivery for a week",
      icon: "ri-restaurant-line",
      earned: false,
      earnedDate: undefined,
    });
    
    this.createBadge({
      userId: id,
      name: "Impulse Ninja",
      description: "Cancelled an impulsive spend",
      icon: "ri-shield-check-line",
      earned: true,
      earnedDate: new Date(),
    });
    
    // Create sample budget
    this.createBudgetSettings({
      userId: id,
      monthlyBudget: 30000,
      essentialsPercentage: 50,
      foodPercentage: 20,
      funPercentage: 20,
      treatsPercentage: 10,
    });
    
    // Create connected apps
    this.createConnectedApp({
      userId: id,
      appName: "Google Pay",
      appType: "payment",
      connected: true,
    });
    
    this.createConnectedApp({
      userId: id,
      appName: "PhonePe",
      appType: "payment",
      connected: false,
    });
    
    this.createConnectedApp({
      userId: id,
      appName: "Paytm",
      appType: "payment",
      connected: false,
    });
    
    this.createConnectedApp({
      userId: id,
      appName: "Amazon",
      appType: "shopping",
      connected: true,
    });
    
    this.createConnectedApp({
      userId: id,
      appName: "Myntra",
      appType: "shopping",
      connected: true,
    });
    
    this.createConnectedApp({
      userId: id,
      appName: "Zomato",
      appType: "food",
      connected: false,
    });
    
    // Create sample transactions
    this.createTransaction({
      userId: id,
      amount: 1999,
      category: "shopping",
      description: "Amazon purchase",
      date: new Date(),
      type: "expense",
      isWant: true,
      merchant: "Amazon",
    });
    
    this.createTransaction({
      userId: id,
      amount: 45000,
      category: "income",
      description: "Salary Deposit",
      date: new Date(Date.now() - 86400000), // yesterday
      type: "income",
      isWant: false,
      merchant: "Bank",
    });
    
    this.createTransaction({
      userId: id,
      amount: 520,
      category: "food",
      description: "Food Delivery",
      date: new Date(Date.now() - 86400000 * 3), // 3 days ago
      type: "expense",
      isWant: true,
      merchant: "Zomato",
    });
    
    // Create more transactions for the month
    for (let i = 1; i <= 10; i++) {
      this.createTransaction({
        userId: id,
        amount: 200 + (i * 50),
        category: "food",
        description: "Food purchase",
        date: new Date(Date.now() - 86400000 * i),
        type: "expense",
        isWant: i % 2 === 0,
        merchant: i % 2 === 0 ? "Zomato" : "Grocery Store",
      });
    }
    
    for (let i = 1; i <= 8; i++) {
      this.createTransaction({
        userId: id,
        amount: 500 + (i * 300),
        category: "shopping",
        description: "Fashion purchase",
        date: new Date(Date.now() - 86400000 * i * 2),
        type: "expense",
        isWant: true,
        merchant: i % 2 === 0 ? "Amazon" : "Myntra",
      });
    }
    
    return user;
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId,
    ).sort((a, b) => {
      if (a.date && b.date) {
        return b.date.getTime() - a.date.getTime();
      }
      return 0;
    });
  }

  async getTransactionsByMonth(userId: number, month: number, year: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => {
        if (!transaction.date) return false;
        const transDate = new Date(transaction.date);
        return transaction.userId === userId && 
               transDate.getMonth() === month && 
               transDate.getFullYear() === year;
      }
    ).sort((a, b) => {
      if (a.date && b.date) {
        return b.date.getTime() - a.date.getTime();
      }
      return 0;
    });
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = { 
      id,
      userId: insertTransaction.userId,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      category: insertTransaction.category,
      description: insertTransaction.description,
      date: insertTransaction.date || null,
      isWant: insertTransaction.isWant || null,
      merchant: insertTransaction.merchant || null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Goal operations
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId,
    );
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const goal: Goal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, goalUpdate: Partial<Goal>): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    if (!existingGoal) return undefined;
    
    const updatedGoal = { ...existingGoal, ...goalUpdate };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  // Badge operations
  async getBadges(userId: number): Promise<Badge[]> {
    return Array.from(this.badges.values()).filter(
      (badge) => badge.userId === userId,
    );
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.badgeIdCounter++;
    const badge: Badge = { ...insertBadge, id };
    this.badges.set(id, badge);
    return badge;
  }

  async updateBadge(id: number, badgeUpdate: Partial<Badge>): Promise<Badge | undefined> {
    const existingBadge = this.badges.get(id);
    if (!existingBadge) return undefined;
    
    const updatedBadge = { ...existingBadge, ...badgeUpdate };
    this.badges.set(id, updatedBadge);
    return updatedBadge;
  }

  // Budget operations
  async getBudgetSettings(userId: number): Promise<BudgetSetting | undefined> {
    return Array.from(this.budgetSettings.values()).find(
      (budget) => budget.userId === userId,
    );
  }

  async createBudgetSettings(insertBudget: InsertBudgetSetting): Promise<BudgetSetting> {
    const id = this.budgetIdCounter++;
    const budget: BudgetSetting = { ...insertBudget, id };
    this.budgetSettings.set(id, budget);
    return budget;
  }

  async updateBudgetSettings(userId: number, budgetUpdate: Partial<BudgetSetting>): Promise<BudgetSetting | undefined> {
    const existingBudget = Array.from(this.budgetSettings.values()).find(
      (budget) => budget.userId === userId,
    );
    
    if (!existingBudget) return undefined;
    
    const updatedBudget = { ...existingBudget, ...budgetUpdate };
    this.budgetSettings.set(existingBudget.id, updatedBudget);
    return updatedBudget;
  }

  // Connected Apps operations
  async getConnectedApps(userId: number): Promise<ConnectedApp[]> {
    return Array.from(this.connectedApps.values()).filter(
      (app) => app.userId === userId,
    );
  }

  async createConnectedApp(insertApp: InsertConnectedApp): Promise<ConnectedApp> {
    const id = this.appIdCounter++;
    const app: ConnectedApp = { ...insertApp, id };
    this.connectedApps.set(id, app);
    return app;
  }

  async updateConnectedApp(id: number, appUpdate: Partial<ConnectedApp>): Promise<ConnectedApp | undefined> {
    const existingApp = this.connectedApps.get(id);
    if (!existingApp) return undefined;
    
    const updatedApp = { ...existingApp, ...appUpdate };
    this.connectedApps.set(id, updatedApp);
    return updatedApp;
  }
}

// Using MemStorage for development
export const storage = new MemStorage();
