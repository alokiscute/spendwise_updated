import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Receipt, ChevronRight, AlertCircle, Sparkles } from "lucide-react";
import ConnectedAppsSection from "@/components/ConnectedAppsSection";
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

export default function Dashboard() {
  // State for modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showChatbotModal, setShowChatbotModal] = useState(false);
  const [todaySpent, setTodaySpent] = useState(0);
  
  // Use query hooks to fetch real data
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });
  
  const { data: goalData = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/goals'],
    retry: false,
  });
  
  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ['/api/budget'],
    retry: false,
  });
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const { data: transactionData = [], isLoading: transactionsLoading } = useQuery({
    queryKey: [`/api/transactions/month/${currentMonth}/year/${currentYear}`],
    retry: false,
  });
  
  // Define types for our data
  interface User {
    nickname?: string;
    username: string;
  }
  
  interface Goal {
    name: string;
    emoji: string;
    targetAmount: number;
    currentAmount: number;
    completed: boolean;
    isPrimary: boolean;
  }
  
  interface Budget {
    monthlyBudget: number;
    essentialsPercentage: number;
    foodPercentage: number;
    funPercentage: number;
    treatsPercentage: number;
  }
  
  interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: string;
    category: string;
    date: Date;
    isWant: boolean;
    merchant: string | null;
  }
  
  // Set up dynamic state based on API data
  const defaultUser: User = {
    nickname: "User",
    username: "user123"
  };
  
  const user: User = userData ? userData as User : defaultUser;
  
  const [primaryGoal, setPrimaryGoal] = useState<Goal>({
    name: "Savings Goal",
    emoji: "💰",
    targetAmount: 1000,
    currentAmount: 0,
    completed: false,
    isPrimary: true
  });
  
  // Update primary goal when data is available
  useEffect(() => {
    if (goalData && Array.isArray(goalData) && goalData.length > 0) {
      const mainGoal = goalData.find((g: any) => g.isPrimary) || goalData[0];
      if (mainGoal) {
        setPrimaryGoal(mainGoal as Goal);
      }
    }
  }, [goalData]);
  
  const defaultBudget: Budget = {
    monthlyBudget: 2000,
    essentialsPercentage: 40,
    foodPercentage: 30,
    funPercentage: 20,
    treatsPercentage: 10
  };
  
  const budget: Budget = budgetData ? budgetData as Budget : defaultBudget;
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Update transactions when data is available
  useEffect(() => {
    if (transactionData && Array.isArray(transactionData) && transactionData.length > 0) {
      setTransactions(transactionData as Transaction[]);
    }
  }, [transactionData]);
  
  // Calculate monthly spending stats
  
  const monthlySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSavings = primaryGoal.currentAmount;
  const totalSpent = monthlySpending;
  const budgetPercentage = (totalSpent / budget.monthlyBudget) * 100;
  
  const budgetRemaining = budget.monthlyBudget - monthlySpending;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = daysInMonth - currentDay;
  const dailyBudget = daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;
  
  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Hi, {user.nickname || 'there'}!</h2>
          <p className="text-sm text-muted-foreground">Here's your financial overview</p>
        </div>
        <Avatar>
          <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.username}`} alt={user.nickname || 'User'} />
          <AvatarFallback>{user.nickname?.[0] || user.username?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </header>
      
      {/* Budget Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-background to-secondary/10">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Monthly Budget
                <Badge variant="outline" className="text-xs font-normal bg-primary/10">
                  {daysRemaining} days left
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-bold">
                ₹{budgetRemaining.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                of ₹{budget.monthlyBudget.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
          
          <div className="relative mt-2 mb-4">
            <Progress 
              value={(budgetRemaining / (budget.monthlyBudget || 1)) * 100} 
              className="h-3 mb-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-secondary/30 p-4 rounded-lg backdrop-blur-sm border border-secondary/20 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Daily Budget</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={() => {
                    const newAmount = prompt("Enter new daily budget:", dailyBudget.toFixed(2));
                    if (newAmount !== null && !isNaN(Number(newAmount))) {
                      alert(`Daily budget updated to ₹${newAmount}`);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                </Button>
              </div>
              <p className="font-bold text-xl mt-1">₹{dailyBudget.toFixed(2)}</p>
            </div>
            <div className="bg-secondary/30 p-4 rounded-lg backdrop-blur-sm border border-secondary/20 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Spent Today</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={() => {
                    const newAmount = prompt("Enter today's spending amount:", todaySpent.toFixed(2));
                    if (newAmount !== null && !isNaN(Number(newAmount))) {
                      setTodaySpent(Number(newAmount));
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                </Button>
              </div>
              <p className="font-bold text-xl mt-1">₹{todaySpent.toFixed(2)}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 gap-2 bg-white/50 hover:bg-white/80 font-medium"
            onClick={() => {
              const amount = prompt("Enter expense amount:");
              if (amount && !isNaN(Number(amount))) {
                const description = prompt("Enter expense description:");
                if (description) {
                  const category = prompt("Enter category (e.g., Food, Shopping, Bills):");
                  if (category) {
                    const isWant = confirm("Is this a want (OK) or a need (Cancel)?");
                    const merchant = prompt("Enter merchant (optional):");
                    
                    // Create new transaction
                    const newTransaction = {
                      id: transactions.length + 1,
                      description,
                      amount: Number(amount),
                      type: "expense",
                      category,
                      date: new Date(),
                      isWant,
                      merchant: merchant || null
                    };
                    
                    // Update transactions
                    setTransactions([newTransaction, ...transactions]);
                    
                    // Update today's spending
                    setTodaySpent(todaySpent + Number(amount));
                    
                    alert("Expense added successfully!");
                  }
                }
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Expense
          </Button>
        </CardContent>
      </Card>
      
      {/* Primary Goal */}
      {primaryGoal && (
        <Card className="bg-gradient-to-br from-background to-primary/5 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="text-3xl bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center">
                  {primaryGoal.emoji || '🎯'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{primaryGoal.name}</h3>
                  <Badge 
                    variant={primaryGoal.completed ? "default" : "outline"}
                    className={primaryGoal.completed ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {primaryGoal.completed ? "Completed 🎉" : "In Progress"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Target</span>
                <span className="text-lg font-bold">₹{primaryGoal.targetAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-4 mb-2 relative">
              <div className="flex justify-between mb-2 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Current</span>
                  <p className="font-semibold">₹{primaryGoal.currentAmount?.toFixed(2) || '0.00'}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-1 text-xs"
                  onClick={() => {
                    const amount = prompt("Enter amount to add to your goal:", "50");
                    if (amount && !isNaN(Number(amount))) {
                      const newAmount = primaryGoal.currentAmount + Number(amount);
                      
                      // Check if goal is now completed
                      const isCompleted = newAmount >= primaryGoal.targetAmount;
                      
                      // Update goal
                      setPrimaryGoal({
                        ...primaryGoal,
                        currentAmount: newAmount,
                        completed: isCompleted
                      });
                      
                      // Show success message
                      if (isCompleted) {
                        alert("🎉 Congratulations! You've reached your goal!");
                      } else {
                        alert(`₹${amount} added to your goal!`);
                      }
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Add Funds
                </Button>
              </div>
              
              <Progress 
                value={(primaryGoal.currentAmount || 0) / primaryGoal.targetAmount * 100}
                className="h-3"
              />
              
              {/* Milestone markers */}
              <div className="relative h-6 mt-1">
                <div className="absolute left-1/4 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                  <span className="text-xs text-muted-foreground">25%</span>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                  <span className="text-xs text-muted-foreground">50%</span>
                </div>
                <div className="absolute left-3/4 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                  <span className="text-xs text-muted-foreground">75%</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm">
                <span className={`font-medium ${primaryGoal.completed ? "text-green-500" : ""}`}>
                  {primaryGoal.completed 
                    ? "Goal completed! Amazing work! 🚀" 
                    : `₹${((primaryGoal.targetAmount) - (primaryGoal.currentAmount || 0)).toFixed(2)} more to go`
                  }
                </span>
              </div>
              
              <div className="flex gap-1">
                {!primaryGoal.completed && (
                  <Button variant="ghost" size="sm" className="p-1.5 h-8">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                    </svg>
                  </Button>
                )}
                
                <Button variant="ghost" size="sm" className="p-1.5 h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Recent Transactions
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Synced with GPay
            </Badge>
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 6.5H16" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6.5H2" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10C11.933 10 13.5 8.433 13.5 6.5C13.5 4.567 11.933 3 10 3C8.067 3 6.5 4.567 6.5 6.5C6.5 8.433 8.067 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 17.5H18" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 17.5H2" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 21C15.933 21 17.5 19.433 17.5 17.5C17.5 15.567 15.933 14 14 14C12.067 14 10.5 15.567 10.5 17.5C10.5 19.433 12.067 21 14 21Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Filter
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/insights">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* UPI Apps Row */}
        <div className="flex overflow-x-auto pb-2 gap-3 mb-4 no-scrollbar">
          <div 
            className="flex flex-col items-center min-w-[72px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("https://pay.google.com", "_blank")}
          >
            <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center p-3 mb-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png" alt="GPay" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-medium">GPay</p>
          </div>
          <div 
            className="flex flex-col items-center min-w-[72px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("https://www.phonepe.com", "_blank")}
          >
            <div className="w-14 h-14 rounded-full bg-purple-700 shadow-md flex items-center justify-center p-3 mb-1">
              <svg viewBox="0 0 122.88 122.88" className="w-full h-full" fill="white">
                <path d="M17.89,0h87.1c9.87,0,17.89,8.02,17.89,17.89v87.1c0,9.87-8.02,17.89-17.89,17.89h-87.1C8.02,122.88,0,114.86,0,104.99v-87.1C0,8.02,8.02,0,17.89,0L17.89,0z M36.54,39.5h8.57v15.34h-8.57V39.5L36.54,39.5z M48.6,39.45h8.45v33.49c0,1.33,0.1,2.32,0.29,2.98c0.2,0.66,0.57,1.13,1.1,1.43c0.52,0.3,1.29,0.45,2.31,0.45c0.44,0,0.88-0.02,1.35-0.07c0.46-0.05,0.97-0.13,1.52-0.25v6.22c-0.41,0.21-1.03,0.4-1.87,0.55c-0.84,0.15-1.63,0.23-2.38,0.23c-2.92,0-5.11-0.65-6.54-1.95c-1.43-1.3-2.15-3.33-2.15-6.11V39.45L48.6,39.45z M88.54,39.5v5.12l-4.53,1.5c1.1,1.67,1.65,3.49,1.65,5.48c0,3.09-1.05,5.55-3.14,7.39c-2.09,1.84-4.97,2.76-8.62,2.76c-0.46,0-0.91-0.02-1.35-0.06c-0.44-0.04-0.84-0.09-1.21-0.16c-0.11,0.07-0.35,0.25-0.73,0.55c-0.38,0.3-0.56,0.65-0.56,1.07c0,0.42,0.19,0.76,0.59,1.01c0.39,0.24,0.99,0.37,1.81,0.37h4.36c2.88,0,5.1,0.63,6.65,1.89c1.55,1.26,2.32,3.05,2.32,5.36c0,3.1-1.27,5.53-3.81,7.29c-2.54,1.76-6.03,2.64-10.48,2.64c-2.87,0-5.14-0.27-6.8-0.82c-1.65-0.55-2.85-1.3-3.59-2.26c-0.74-0.96-1.11-2.06-1.11-3.3c0-1.57,0.44-2.83,1.32-3.76c0.88-0.93,2.1-1.6,3.66-2.01c-0.62-0.27-1.14-0.65-1.57-1.15c-0.43-0.5-0.64-1.12-0.64-1.87c0-0.96,0.26-1.75,0.77-2.37c0.51-0.62,1.23-1.18,2.15-1.69c-1.44-0.6-2.59-1.59-3.47-2.97c-0.88-1.38-1.31-2.95-1.31-4.71c0-3.17,1.03-5.71,3.09-7.61c2.06-1.9,4.89-2.85,8.5-2.85c1.55,0,2.97,0.19,4.25,0.56c1.28,0.37,2.33,0.84,3.14,1.41H88.54L88.54,39.5z M74.19,71.98c-0.58,0.34-1.16,0.67-1.75,0.99c-0.59,0.32-1.17,0.59-1.75,0.81c-0.58,0.22-1.13,0.33-1.66,0.33c-1.45,0-2.56-0.32-3.33-0.97c-0.77-0.65-1.16-1.48-1.16-2.51c0-1.03,0.53-1.93,1.59-2.7c1.06-0.77,2.51-1.16,4.35-1.16c0.98,0,1.85,0.1,2.63,0.29c0.78,0.19,1.57,0.42,2.37,0.69c0,1.34-0.21,2.64-0.62,3.9C74.53,71.91,74.38,71.96,74.19,71.98L74.19,71.98z M72.68,51.66c0,1.33-0.37,2.41-1.1,3.23c-0.73,0.82-1.77,1.23-3.11,1.23c-1.34,0-2.39-0.4-3.12-1.19c-0.74-0.79-1.11-1.92-1.11-3.38c0-1.41,0.37-2.53,1.11-3.37c0.74-0.84,1.77-1.25,3.09-1.25c1.37,0,2.42,0.4,3.14,1.2C72.31,48.93,72.68,50.11,72.68,51.66L72.68,51.66z"></path>
              </svg>
            </div>
            <p className="text-xs font-medium">PhonePe</p>
          </div>
          <div 
            className="flex flex-col items-center min-w-[72px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("https://paytm.com", "_blank")}
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 shadow-md flex items-center justify-center p-3 mb-1">
              <svg viewBox="0 0 512 512" className="w-full h-full" fill="#00BAF2">
                <path d="M409.194,35.816H102.806c-36.995,0-66.99,29.599-66.99,66.594v307.18c0,36.995,29.594,66.594,66.99,66.594h306.389 c36.995,0,67-29.599,67-66.594V102.41C476.194,65.415,446.189,35.816,409.194,35.816z M198.995,246.729 c-19.608,22.258-49.005,36.34-81.79,36.34c-37.196,0-69.334-18.97-88.44-47.534l31.728-24.52 c12.327,21.115,35.117,35.273,61.217,35.273c23.266,0,44.177-11.237,57.307-28.615l0.295-0.295l0.295-0.295l0.591-0.886 l0.295-0.295l0.295-0.295l0.886-1.477l-26.198-20.229L160.62,190l35.864,27.784c0.091-0.091,0.193-0.193,0.284-0.295 l0.295-0.295L198.995,246.729z M242.677,240.711c0,15.92-12.918,28.838-28.838,28.838s-28.838-12.918-28.838-28.838 s12.918-28.838,28.838-28.838S242.677,224.791,242.677,240.711z M363.375,240.711c0,15.92-12.918,28.838-28.838,28.838 c-15.909,0-28.838-12.918-28.838-28.838s12.929-28.838,28.838-28.838C350.458,211.873,363.375,224.791,363.375,240.711z M484,240.711c0,15.92-12.918,28.838-28.838,28.838s-28.838-12.918-28.838-28.838s12.918-28.838,28.838-28.838 S484,224.791,484,240.711z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Paytm</p>
          </div>
          <div 
            className="flex flex-col items-center min-w-[72px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("https://www.amazon.in/amazonpay", "_blank")}
          >
            <div className="w-14 h-14 rounded-full bg-blue-900 shadow-md flex items-center justify-center p-3 mb-1">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="#FF9900">
                <path d="M15.93,17.09C15.75,17.25,15.5,17.26,15.3,17.15C14.41,16.41,14,16.07,13.53,15.53C13.19,15.88,12.91,16.17,12.62,16.44C12.57,16.5,12.54,16.57,12.53,16.64L12.72,17.69C12.76,17.92,12.63,18.15,12.41,18.21C12.2,18.27,11.97,18.14,11.89,17.93L11.39,16.47L10.33,16.92C10.11,17.01,9.85,16.92,9.72,16.71C9.6,16.5,9.64,16.24,9.82,16.08C10.1,15.87,10.41,15.64,10.69,15.43L9.8,15.03L9.95,14.79C10.36,14.22,10.88,13.66,11.43,13.18C11.09,12.98,10.71,12.7,10.5,12.36C10.18,11.82,10.23,11.2,10.62,10.71C10.87,10.39,11.29,10.03,11.9,10.36C12.16,10.5,12.36,10.73,12.58,10.96C13.05,11.47,13.34,12.11,13.24,12.85C13.18,13.28,13.03,13.7,12.81,14.07C13.13,14.37,13.43,14.69,13.73,15.03C14.15,14.68,14.59,14.36,15.03,14.04C15.16,13.95,15.31,13.92,15.46,13.93C15.67,13.96,15.85,14.09,15.91,14.29C15.96,14.48,15.9,14.69,15.73,14.81C15.33,15.1,14.91,15.38,14.49,15.65C14.95,16.08,15.39,16.55,15.98,16.83C16.18,16.92,16.33,17.14,16.33,17.37C16.32,17.61,16.17,17.83,15.93,17.09Z"/>
              </svg>
            </div>
            <p className="text-xs font-medium">Amazon Pay</p>
          </div>
          <div 
            className="flex flex-col items-center min-w-[72px] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.open("https://app.cred.club", "_blank")}
          >
            <div className="w-14 h-14 rounded-full bg-black shadow-md flex items-center justify-center p-3 mb-1">
              <img src="https://iconape.com/wp-content/png_logo_vector/cred-logo.png" alt="CRED" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-medium">CRED</p>
          </div>
          <div 
            className="flex flex-col items-center min-w-[72px] cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 shadow-md flex items-center justify-center p-3 mb-1 border border-dashed border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-gray-400">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-500">Add New</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.slice(0, 3).map((transaction, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                      transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {transaction.type === 'expense' ? (
                        <ArrowDownLeft className="h-5 w-5 text-red-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.isWant && (
                          <Badge variant="outline" className="ml-2 text-xs px-2 h-5 bg-amber-50 text-amber-500 border-amber-100">
                            Want
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        {transaction.merchant && (
                          <span className="flex items-center ml-2">
                            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block mr-1"></span>
                            via {transaction.merchant}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className={`font-bold ${
                      transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                    </p>
                    {/* Payment app indicator if available */}
                    {transaction.type === 'expense' && (
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <svg viewBox="0 0 512 512" className="w-3 h-3 mr-1" fill="#00BAF2">
                          <path d="M409.194,35.816H102.806c-36.995,0-66.99,29.599-66.99,66.594v307.18c0,36.995,29.594,66.594,66.99,66.594h306.389 c36.995,0,67-29.599,67-66.594V102.41C476.194,65.415,446.189,35.816,409.194,35.816z M198.995,246.729 c-19.608,22.258-49.005,36.34-81.79,36.34c-37.196,0-69.334-18.97-88.44-47.534l31.728-24.52 c12.327,21.115,35.117,35.273,61.217,35.273c23.266,0,44.177-11.237,57.307-28.615l0.295-0.295l0.295-0.295l0.591-0.886 l0.295-0.295l0.295-0.295l0.886-1.477l-26.198-20.229L160.62,190l35.864,27.784c0.091-0.091,0.193-0.193,0.284-0.295 l0.295-0.295L198.995,246.729z M242.677,240.711c0,15.92-12.918,28.838-28.838,28.838s-28.838-12.918-28.838-28.838 s12.918-28.838,28.838-28.838S242.677,224.791,242.677,240.711z M363.375,240.711c0,15.92-12.918,28.838-28.838,28.838 c-15.909,0-28.838-12.918-28.838-28.838s12.929-28.838,28.838-28.838C350.458,211.873,363.375,224.791,363.375,240.711z M484,240.711c0,15.92-12.918,28.838-28.838,28.838s-28.838-12.918-28.838-28.838s12.918-28.838,28.838-28.838 S484,224.791,484,240.711z" />
                        </svg>
                        paid via Paytm
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium mb-1">No transactions yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Link your UPI apps or add transactions manually
                </p>
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Add Manual
                  </Button>
                  <Button size="sm" variant="default">
                    Link UPI
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Wants vs Needs Analysis */}
      <Card className="overflow-hidden bg-gradient-to-br from-background to-cyan-50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                Spending Breakdown
                <Badge variant="outline" className="text-xs font-normal">April 2025</Badge>
              </CardTitle>
              <CardDescription>How you spend your money</CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-8 text-xs">Week</Button>
              <Button variant="default" size="sm" className="h-8 text-xs">Month</Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs">Year</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="md:w-1/2">
              {/* Circular donut visualization */}
              <div className="relative h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Wants', value: 35, color: '#f87171' },
                        { name: 'Needs', value: 50, color: '#60a5fa' },
                        { name: 'Savings', value: 15, color: '#4ade80' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[
                        { name: 'Wants', value: 35, color: '#f87171' },
                        { name: 'Needs', value: 50, color: '#60a5fa' },
                        { name: 'Savings', value: 15, color: '#4ade80' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Percentage']}
                      contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold">${monthlySpending.toFixed(0)}</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 flex flex-col justify-center gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
                    <p className="text-xs font-medium">Wants</p>
                  </div>
                  <p className="text-xl font-bold">
                    {Math.round(
                      (transactions.filter(t => t.isWant && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 
                      (monthlySpending || 1)) * 100
                    )}%
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
                    <p className="text-xs font-medium">Needs</p>
                  </div>
                  <p className="text-xl font-bold">
                    {Math.round(
                      (transactions.filter(t => !t.isWant && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 
                      (monthlySpending || 1)) * 100
                    )}%
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
                    <p className="text-xs font-medium">Savings</p>
                  </div>
                  <p className="text-xl font-bold">
                    {Math.round(
                      ((monthlyIncome - monthlySpending) / (monthlyIncome || 1)) * 100
                    )}%
                  </p>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-sm font-medium mb-2">Your monthly breakdown:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#f87171" className="w-4 h-4 mr-2">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs">Shopping & Entertainment</p>
                    </div>
                    <p className="text-xs font-semibold">$350.00</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#60a5fa" className="w-4 h-4 mr-2">
                        <path d="M4 4c0-.556.038-1.088.111-1.6.554.22 1.147.47 1.766.777C6.956 3.651 8.128 4 9.5 4c1.372 0 2.544-.349 3.622-.823.62-.307 1.212-.557 1.766-.777.073.512.111 1.044.111 1.6 0 3.866-3.582 7-8 7s-8-3.134-8-7z" />
                        <path d="M4.5 8a1 1 0 10-2 0 6 6 0 1012 0 1 1 0 10-2 0 4 4 0 11-8 0z" />
                      </svg>
                      <p className="text-xs">Rent & Bills</p>
                    </div>
                    <p className="text-xs font-semibold">$800.00</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#4ade80" className="w-4 h-4 mr-2">
                        <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs">Savings</p>
                    </div>
                    <p className="text-xs font-semibold">$350.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="w-full mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
              <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
              <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
            </svg>
            See Detailed Analysis
          </Button>
        </CardContent>
      </Card>
      
      {/* AI Insights Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-purple-300/10 border-primary/20">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold mb-1">AI Spending Insight</h3>
            <p className="text-sm text-muted-foreground">
              You've spent 38% more on food delivery this month compared to last month. Consider cooking at home to reach your laptop savings goal faster.
            </p>
            <Button 
              variant="link" 
              className="p-0 mt-2 h-auto text-primary"
              onClick={() => setShowChatbotModal(true)}
            >
              Get Personalized Tips
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Chatbot Modal */}
      {showChatbotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg overflow-hidden">
            <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Financial Assistant
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowChatbotModal(false)}
                className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
                  <p className="text-sm">
                    Hi Alex! I've analyzed your spending habits. What would you like help with today?
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 flex-row-reverse">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-600">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg shadow-sm max-w-[80%]">
                  <p className="text-sm">
                    I want to save more for my laptop goal. Any tips?
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
                  <p className="text-sm">
                    Based on your spending, here are 3 ways to save more:
                  </p>
                  <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                    <li>Cut food delivery costs by cooking at home 2 more days per week (save ~₹40)</li>
                    <li>Use the "round-up" feature to automatically save change from purchases</li>
                    <li>Consider setting aside 20% of your income right when you get paid</li>
                  </ul>
                  <p className="text-sm mt-2">Would you like more specific advice for any of these?</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                  Send
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="text-xs">How to save more?</Button>
                <Button variant="outline" size="sm" className="text-xs">Budget help</Button>
                <Button variant="outline" size="sm" className="text-xs">Reduce spending</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Connected Apps Section */}
      <ConnectedAppsSection />
    </div>
  );
}