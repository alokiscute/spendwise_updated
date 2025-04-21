import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nickname: text("nickname"),
  avatarType: text("avatar_type").default("funny"),
  ageRange: text("age_range"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  nickname: true,
  avatarType: true,
  ageRange: true,
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow(),
  type: text("type").notNull(), // 'income' or 'expense'
  isWant: boolean("is_want").default(true), // true for wants, false for needs
  merchant: text("merchant"),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  category: true,
  description: true,
  date: true,
  type: true,
  isWant: true,
  merchant: true,
});

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  emoji: text("emoji").default("💰"),
  targetAmount: doublePrecision("target_amount").notNull(),
  currentAmount: doublePrecision("current_amount").default(0),
  completed: boolean("completed").default(false),
  isPrimary: boolean("is_primary").default(false),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  name: true,
  emoji: true,
  targetAmount: true,
  currentAmount: true,
  completed: true,
  isPrimary: true,
});

// Badges table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  earned: boolean("earned").default(false),
  earnedDate: timestamp("earned_date"),
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  userId: true,
  name: true,
  description: true,
  icon: true,
  earned: true,
  earnedDate: true,
});

// BudgetSettings table
export const budgetSettings = pgTable("budget_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  monthlyBudget: doublePrecision("monthly_budget").notNull(),
  essentialsPercentage: doublePrecision("essentials_percentage").default(50),
  foodPercentage: doublePrecision("food_percentage").default(20),
  funPercentage: doublePrecision("fun_percentage").default(20),
  treatsPercentage: doublePrecision("treats_percentage").default(10),
});

export const insertBudgetSettingsSchema = createInsertSchema(budgetSettings).pick({
  userId: true,
  monthlyBudget: true,
  essentialsPercentage: true,
  foodPercentage: true,
  funPercentage: true,
  treatsPercentage: true,
});

// ConnectedApps table
export const connectedApps = pgTable("connected_apps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  appName: text("app_name").notNull(),
  appType: text("app_type").notNull(), // 'payment', 'shopping', 'food'
  connected: boolean("connected").default(false),
});

export const insertConnectedAppSchema = createInsertSchema(connectedApps).pick({
  userId: true,
  appName: true,
  appType: true,
  connected: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type BudgetSetting = typeof budgetSettings.$inferSelect;
export type InsertBudgetSetting = z.infer<typeof insertBudgetSettingsSchema>;

export type ConnectedApp = typeof connectedApps.$inferSelect;
export type InsertConnectedApp = z.infer<typeof insertConnectedAppSchema>;
