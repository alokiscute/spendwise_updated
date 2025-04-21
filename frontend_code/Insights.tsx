import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import MLInsights from "@/components/MLInsights";
import TransactionUpload from "@/components/TransactionUpload";

export default function Insights() {
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Get current month and year
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  interface Transaction {
    id: number;
    userId: number;
    amount: number;
    category: string;
    description: string;
    date: string;
    type: string;
    isWant: boolean;
    merchant: string | null;
  }
  
  interface Budget {
    userId: number;
    monthlyBudget: number;
    essentialsPercentage: number;
    foodPercentage: number;
    funPercentage: number;
    treatsPercentage: number;
  }
  
  // Define AI classification interface
  interface SpendingClassification {
    totalSpending: number;
    necessities: number;
    wants: number;
    savings: number;
    topCategories: Array<{category: string, amount: number, percentage: number}>;
    patterns: Array<{
      category: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      averageAmount: number;
      isNecessity: boolean;
      savingsPotential: number;
    }>;
    nextMonthPredictions: Array<{
      category: string;
      predictedAmount: number;
      confidence: number;
    }>;
  }

  // Fetch transactions for the current month
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/month/${month}/year/${year}`],
    retry: false,
  });
  
  // Fetch budget settings
  const { data: budget, isLoading: budgetLoading } = useQuery<Budget>({
    queryKey: ['/api/budget'],
    retry: false,
  });
  
  // Fetch AI classification data
  const { data: aiClassification, isLoading: aiClassificationLoading } = useQuery<SpendingClassification>({
    queryKey: [`/api/ai/spending-classification/${month}/${year}`],
    retry: false,
    enabled: transactions.length > 0, // Only fetch if there are transactions
  });
  
  const isLoading = transactionsLoading || budgetLoading || aiClassificationLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  // Process transactions for charts
  const processCategoryData = () => {
    // If AI classification data is available, use its top categories
    if (aiClassification && aiClassification.topCategories.length > 0) {
      return aiClassification.topCategories.map(category => ({
        name: category.category.charAt(0).toUpperCase() + category.category.slice(1),
        value: category.amount
      }));
    }
    
    // Fallback to manual calculation
    const categories: Record<string, number> = {};
    
    transactions.forEach((tx: Transaction) => {
      if (tx.type === 'expense') {
        if (!categories[tx.category]) {
          categories[tx.category] = 0;
        }
        categories[tx.category] += tx.amount;
      }
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };
  
  const processWantsVsNeedsData = () => {
    let wants = 0;
    let needs = 0;
    
    transactions.forEach((tx: Transaction) => {
      if (tx.type === 'expense') {
        if (tx.isWant) {
          wants += tx.amount;
        } else {
          needs += tx.amount;
        }
      }
    });
    
    return [
      { name: "Wants", value: wants },
      { name: "Needs", value: needs }
    ];
  };
  
  const processWeeklyData = () => {
    const weeks: Record<string, number> = {
      "Week 1": 0,
      "Week 2": 0,
      "Week 3": 0,
      "Week 4": 0
    };
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    transactions.forEach((tx: Transaction) => {
      if (tx.type === 'expense') {
        const date = new Date(tx.date);
        const day = date.getDate();
        
        if (day <= 7) {
          weeks["Week 1"] += tx.amount;
        } else if (day <= 14) {
          weeks["Week 2"] += tx.amount;
        } else if (day <= 21) {
          weeks["Week 3"] += tx.amount;
        } else if (day <= daysInMonth) {
          weeks["Week 4"] += tx.amount;
        }
      }
    });
    
    return Object.entries(weeks).map(([name, value]) => ({
      name,
      amount: value
    }));
  };
  
  const categoryData = processCategoryData();
  const wantsVsNeedsData = processWantsVsNeedsData();
  const weeklyData = processWeeklyData();
  
  // Calculate total spending
  const totalSpending = transactions
    .filter((tx: Transaction) => tx.type === 'expense')
    .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
  
  // Use AI classification data if available, otherwise fallback to manual calculation
  let wantsTotal, needsTotal, wantsPercentage, needsPercentage;
  
  if (aiClassification) {
    // Use the AI classification data which is more accurate
    wantsTotal = aiClassification.wants;
    needsTotal = aiClassification.necessities;
    wantsPercentage = totalSpending > 0 ? Math.round((wantsTotal / totalSpending) * 100) : 0;
    needsPercentage = totalSpending > 0 ? Math.round((needsTotal / totalSpending) * 100) : 0;
  } else {
    // Fallback to the manually calculated data
    wantsTotal = wantsVsNeedsData[0].value;
    needsTotal = wantsVsNeedsData[1].value;
    wantsPercentage = totalSpending > 0 ? Math.round((wantsTotal / totalSpending) * 100) : 0;
    needsPercentage = totalSpending > 0 ? Math.round((needsTotal / totalSpending) * 100) : 0;
  }
  
  // Colors for pie chart
  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
  
  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Spending Insights</h1>
          <p className="text-gray-500">Understand your financial habits</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => navigate("/money-wrapped")}>
            Money Wrapped
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <MLInsights />
      </div>
      
      <div className="mb-6 flex justify-end">
        <TransactionUpload onSuccess={() => {
          // Refetch all relevant data when new transactions are imported
          queryClient.invalidateQueries({
            queryKey: [`/api/transactions/month/${month}/year/${year}`]
          });
          
          // Also refresh AI insights and analysis data
          queryClient.invalidateQueries({
            queryKey: [`/api/ai/insights/month/${month}/year/${year}`]
          });
          
          queryClient.invalidateQueries({
            queryKey: [`/api/ai/spending-classification/${month}/${year}`]
          });
        }} />
      </div>
        
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Monthly Spending</CardTitle>
                <CardDescription>
                  {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">₹{totalSpending.toLocaleString()}</div>
                
                {budget && (
                  <>
                    <p className="text-sm text-gray-500 mb-1">
                      {totalSpending > budget.monthlyBudget ? "Exceeded" : "Out of"} budget of ₹{budget.monthlyBudget.toLocaleString()}
                    </p>
                    <Progress 
                      value={(totalSpending / budget.monthlyBudget) * 100} 
                      variant={totalSpending > budget.monthlyBudget ? "error" : "success"} 
                    />
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Wants vs Needs</CardTitle>
                <CardDescription>Balance between essential and discretionary spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Wants</p>
                    <p className="text-xl font-bold mb-1">₹{wantsTotal.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mb-1">{wantsPercentage}% of total</p>
                    <Progress value={wantsPercentage} variant="secondary" />
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Needs</p>
                    <p className="text-xl font-bold mb-1">₹{needsTotal.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mb-1">{needsPercentage}% of total</p>
                    <Progress value={needsPercentage} variant="default" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-gray-500">
                  {wantsPercentage > 50 ? 
                    "Your want-based spending is higher than recommended. Try to keep it under 30% of your total budget." : 
                    "Great job keeping your wants in check! The ideal ratio is 50% needs, 30% wants, and 20% savings."}
                </p>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction: Transaction, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${
                          transaction.type === 'income' ? 'bg-green-100' : 
                          transaction.category === 'food' ? 'bg-orange-100' : 
                          'bg-red-100'
                        } rounded-full flex items-center justify-center flex-shrink-0`}>
                          <i className={`${
                            transaction.type === 'income' ? 'ri-bank-line text-green-500' : 
                            transaction.category === 'food' ? 'ri-restaurant-line text-orange-500' : 
                            'ri-shopping-bag-line text-red-500'
                          } text-sm`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.merchant || transaction.description}</p>
                          <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </p>
                        <Badge 
                          variant={
                            transaction.type === 'income' ? 'success' : 
                            transaction.isWant ? 'warning' : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {transaction.type === 'income' ? 'Income' : transaction.isWant ? 'Want' : 'Need'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                See where your money is going
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="text-sm">₹{category.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Spending Trend</CardTitle>
                <CardDescription>
                  See how your spending changes throughout the month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="amount" name="Spending" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Insights:</h3>
                  <ul className="space-y-1 text-sm">
                    {weeklyData[0].amount > weeklyData[1].amount && weeklyData[0].amount > weeklyData[2].amount ? (
                      <li className="flex items-center gap-2">
                        <i className="ri-information-line text-blue-600"></i>
                        <span>You tend to spend more at the beginning of the month</span>
                      </li>
                    ) : weeklyData[3].amount > weeklyData[1].amount && weeklyData[3].amount > weeklyData[2].amount ? (
                      <li className="flex items-center gap-2">
                        <i className="ri-information-line text-blue-600"></i>
                        <span>You tend to spend more at the end of the month</span>
                      </li>
                    ) : (
                      <li className="flex items-center gap-2">
                        <i className="ri-information-line text-blue-600"></i>
                        <span>Your spending is relatively consistent throughout the month</span>
                      </li>
                    )}
                    
                    <li className="flex items-center gap-2">
                      <i className="ri-lightbulb-line text-warning-500"></i>
                      <span>Setting a weekly budget can help control impulse spending</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            {/* Display AI Patterns when available */}
            {aiClassification && aiClassification.patterns && aiClassification.patterns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI-Identified Spending Patterns</CardTitle>
                  <CardDescription>
                    Machine learning detected patterns in your spending habits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiClassification.patterns.map((pattern, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium capitalize">{pattern.category}</h4>
                            <p className="text-sm text-muted-foreground">
                              {pattern.frequency.charAt(0).toUpperCase() + pattern.frequency.slice(1)} spending 
                              {pattern.isNecessity ? ' (Necessity)' : ' (Want)'}
                            </p>
                          </div>
                          <Badge variant={pattern.isNecessity ? "outline" : "secondary"}>
                            Avg ₹{pattern.averageAmount.toLocaleString()}
                          </Badge>
                        </div>
                        {pattern.savingsPotential > 0 && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700 flex items-center gap-2">
                            <span className="font-medium">Saving potential: ₹{pattern.savingsPotential.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Display AI Predictions when available */}
            {aiClassification && aiClassification.nextMonthPredictions && aiClassification.nextMonthPredictions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Next Month Predictions</CardTitle>
                  <CardDescription>
                    AI predictions based on your spending patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiClassification.nextMonthPredictions.map((prediction, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                        <div>
                          <h4 className="font-medium capitalize">{prediction.category}</h4>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {Math.round(prediction.confidence * 100)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{prediction.predictedAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
