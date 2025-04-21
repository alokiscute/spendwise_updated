import OpenAI from "openai";
import { Transaction } from "@shared/schema";
import { z } from "zod";

// Create OpenAI client only if API key is available
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } else {
    console.log("OPENAI_API_KEY not set. AI features will return fallback responses.");
  }
} catch (error) {
  console.error("Error initializing OpenAI client:", error);
}

// Define the response schema for ML-based insights
export const insightResponseSchema = z.object({
  summary: z.string(),
  insights: z.array(z.object({
    type: z.enum(["saving_opportunity", "spending_pattern", "behavior_change", "goal_recommendation"]),
    title: z.string(),
    description: z.string(),
    savingPotential: z.number().optional(),
    confidenceScore: z.number().min(0).max(1),
  })),
  monthlyTrend: z.object({
    description: z.string(),
    changePercentage: z.number().optional(),
    isPositive: z.boolean().optional(),
  }),
  nextMonthPrediction: z.object({
    description: z.string(),
    predictedAmount: z.number().optional(),
  }),
  savingTips: z.array(z.string()),
});

export type InsightResponse = z.infer<typeof insightResponseSchema>;

export class AIInsightService {
  /**
   * Analyze user transactions to generate personalized spending insights
   */
  async generateSpendingInsights(
    transactions: Transaction[],
    goals: { name: string; targetAmount: number; currentAmount: number }[],
    monthlyBudget: number
  ): Promise<InsightResponse> {
    try {
      // Filter and prepare transaction data
      const expenseTransactions = transactions.filter(t => t.type === "expense");
      const incomeTransactions = transactions.filter(t => t.type === "income");
      
      // Calculate basic metrics
      const totalSpent = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;
      
      // Categorize spending
      const spendingByCategory = expenseTransactions.reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {} as Record<string, number>);
      
      // Check wants vs needs ratio
      const wantsTotal = expenseTransactions
        .filter(t => t.isWant)
        .reduce((sum, t) => sum + t.amount, 0);
      const needsTotal = expenseTransactions
        .filter(t => !t.isWant)
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Get spending patterns by merchant
      const spendingByMerchant = expenseTransactions.reduce((acc, t) => {
        if (t.merchant) {
          if (!acc[t.merchant]) {
            acc[t.merchant] = 0;
          }
          acc[t.merchant] += t.amount;
        }
        return acc;
      }, {} as Record<string, number>);
      
      // Prepare data for AI analysis
      const analysisData = {
        transactions: {
          expenses: {
            total: totalSpent,
            byCategory: spendingByCategory,
            byMerchant: spendingByMerchant,
            wantsVsNeeds: { wants: wantsTotal, needs: needsTotal },
          },
          income: {
            total: totalIncome,
          },
        },
        financialGoals: goals,
        budget: {
          monthly: monthlyBudget,
          remaining: monthlyBudget - totalSpent,
          savingsRate: savingsRate,
        },
      };
      
      // Check if OpenAI client is available
      if (!openai) {
        // If OpenAI client is not available, return fallback insights
        throw new Error("OpenAI client not available");
      }
      
      // Get insights from OpenAI
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a financial insights AI that analyzes spending data for young adults.
            Your goal is to provide personalized insights, identify spending patterns, and suggest actionable ways to save money or reach financial goals.
            Be very specific with your insights, and focus on the data provided. Your tone should be friendly, understanding, and motivating - never judgmental.
            You should identify potential savings opportunities, highlight spending patterns, suggest behavior changes, and recommend goal-related actions.
            Format your response as JSON to match the following structure exactly:
            {
              "summary": "Brief 1-2 sentence overview of financial situation",
              "insights": [
                {
                  "type": "saving_opportunity | spending_pattern | behavior_change | goal_recommendation",
                  "title": "Short, catchy title",
                  "description": "Detailed explanation with specific suggestions",
                  "savingPotential": float, // Optional estimated amount that could be saved
                  "confidenceScore": float // Between 0 and 1
                }
              ],
              "monthlyTrend": {
                "description": "Description of spending trend compared to typical patterns",
                "changePercentage": float, // Optional percentage change
                "isPositive": boolean // Optional indicator if trend is good
              },
              "nextMonthPrediction": {
                "description": "Prediction about next month's spending",
                "predictedAmount": float // Optional predicted amount
              },
              "savingTips": [
                "Actionable saving tip 1",
                "Actionable saving tip 2"
              ]
            }`
          },
          {
            role: "user",
            content: `Here's my financial data for analysis: ${JSON.stringify(analysisData)}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });
      
      const content = response.choices[0].message.content;
      const insights = content ? JSON.parse(content) : null;
      
      // Validate the response with our schema
      return insightResponseSchema.parse(insights);
      
    } catch (error) {
      console.error("Error generating AI insights:", error);
      
      // Return placeholder insights in case of error
      return {
        summary: "We couldn't generate personalized insights at this time due to insufficient data.",
        insights: [
          {
            type: "spending_pattern",
            title: "Review your transactions",
            description: "Please add more transaction data to get personalized insights.",
            confidenceScore: 1
          }
        ],
        monthlyTrend: {
          description: "Not enough data to determine spending trends."
        },
        nextMonthPrediction: {
          description: "Add more transactions to get spending predictions."
        },
        savingTips: [
          "Track your expenses regularly",
          "Set clear financial goals"
        ]
      };
    }
  }

  /**
   * Generate a personalized response to a user's question about their finances
   */
  async getPersonalizedAdvice(
    question: string,
    transactions: Transaction[],
    goals: { name: string; targetAmount: number; currentAmount: number }[]
  ): Promise<string> {
    try {
      // Prepare financial context
      const expenseTransactions = transactions.filter(t => t.type === "expense");
      const topCategories = Object.entries(
        expenseTransactions.reduce((acc, t) => {
          if (!acc[t.category]) {
            acc[t.category] = 0;
          }
          acc[t.category] += t.amount;
          return acc;
        }, {} as Record<string, number>)
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, amount]) => ({ category, amount }));

      const wantsVsNeeds = {
        wants: expenseTransactions.filter(t => t.isWant).reduce((sum, t) => sum + t.amount, 0),
        needs: expenseTransactions.filter(t => !t.isWant).reduce((sum, t) => sum + t.amount, 0)
      };
      
      // Check if OpenAI client is available
      if (!openai) {
        // If OpenAI client is not available, return fallback advice
        throw new Error("OpenAI client not available");
      }
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful, empathetic financial advisor for young adults. 
            Your advice should be personalized, practical, and actionable.
            Be conversational but concise (max 150 words), use simple language, and focus on advice that's relevant for young adults.
            Never be judgmental about spending habits.`
          },
          {
            role: "user",
            content: `Here's some context about my finances:
            - Top spending categories: ${JSON.stringify(topCategories)}
            - Wants vs. Needs ratio: ${JSON.stringify(wantsVsNeeds)}
            - Financial goals: ${JSON.stringify(goals)}
            
            My question is: ${question}`
          }
        ],
        max_tokens: 500
      });
      
      const content = response.choices[0].message.content;
      return content !== null ? content : "I'm sorry, I couldn't generate advice at this time. Please try again later.";
      
    } catch (error) {
      console.error("Error generating personalized advice:", error);
      return "I'm having trouble analyzing your financial data right now. Please try again later.";
    }
  }
}

export const aiInsightService = new AIInsightService();