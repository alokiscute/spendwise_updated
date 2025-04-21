import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { ChevronRight, ChevronLeft, Share2, ArrowRight, Sparkles } from "lucide-react";

// Define type for insights API response
interface InsightsResponse {
  spendingByCategory: Record<string, number>;
  topCategory: string;
  topAmount: number;
  totalSpending: number;
  totalSaving: number;
  topMerchant: string;
  topCount: number;
  biggestSpend: number;
  transactionCount: number;
}

// Define the pages for our Wrapped-style experience
type WrappedPage = {
  id: number;
  title: string;
};

export default function MoneyWrapped() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  
  // Get current month and year for insights
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  // Fetch insights for the current month
  const { data: insights, isLoading } = useQuery<InsightsResponse>({
    queryKey: [`/api/insights/month/${month}/year/${year}`],
    retry: false,
  });

  // Define the pages for our Wrapped-style experience
  const pages: WrappedPage[] = [
    { id: 0, title: "Introduction" },
    { id: 1, title: "Spending Identity" },
    { id: 2, title: "Spending Breakdown" },
    { id: 3, title: "Savings Progress" },
    { id: 4, title: "Next Month Challenge" },
  ];
  
  // Auto-progress through pages on first load
  useEffect(() => {
    // Start animation after a short delay
    const animationTimeout = setTimeout(() => {
      setAnimate(true);
    }, 500);

    return () => clearTimeout(animationTimeout);
  }, []);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setDirection("forward");
      setAnimate(false);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setAnimate(true);
      }, 300);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setDirection("backward");
      setAnimate(false);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setAnimate(true);
      }, 300);
    }
  };
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-primary-600 to-primary-800 z-40 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-white animate-pulse mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Generating Your Money Wrapped</h3>
          <p className="text-primary-200">We're analyzing your financial journey...</p>
        </div>
      </div>
    );
  }
  
  // Identity based on top category
  let identity = "General Spender";
  let identityEmoji = "💰";
  let challengeEmoji = "💰";
  let challengeTitle = "Spending Challenge";
  let challengeDesc = "Cut your overall spending by 20%";
  
  if (insights) {
    if (insights.topCategory === "shopping") {
      identity = "Fashion Fiend";
      identityEmoji = "🛍️";
      challengeEmoji = "👗";
      challengeTitle = "Fashion Detox";
      challengeDesc = "Cut your fashion spending by 30%";
    } else if (insights.topCategory === "food") {
      identity = "Foodie Fanatic";
      identityEmoji = "🍔";
      challengeEmoji = "🍕";
      challengeTitle = "Dining Diet";
      challengeDesc = "Reduce food delivery by 25%";
    } else if (insights.topCategory === "entertainment") {
      identity = "Entertainment Enthusiast";
      identityEmoji = "🎮";
      challengeEmoji = "🎬";
      challengeTitle = "Entertainment Embargo";
      challengeDesc = "Cut entertainment spending by 20%";
    }
  }
  
  // Estimated saving from challenge
  const estimatedSaving = insights?.topAmount ? Math.round(insights.topAmount * 0.3) : 2550;

  // Progress percentage for progress bar
  const progressPercentage = ((currentPage + 1) / pages.length) * 100;
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-600 to-primary-900 z-40 overflow-hidden">
      {/* Header with progress */}
      <div className="p-6 pt-8">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-white">{monthName} Money Wrapped</h1>
          <button className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between text-xs text-primary-200 mb-1">
            <span>{currentPage + 1} of {pages.length}</span>
            <span>{pages[currentPage].title}</span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>
      </div>
      
      {/* Page content with animations */}
      <div className={`px-6 transition-all duration-500 transform ${animate ? 'opacity-100 translate-x-0' : direction === 'forward' ? 'opacity-0 translate-x-full' : 'opacity-0 -translate-x-full'}`}>
        {/* Intro Page */}
        {currentPage === 0 && (
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center p-3">
                <div className="w-full h-full rounded-full bg-primary/80 flex items-center justify-center">
                  <span className="text-6xl">💸</span>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Your Financial Year in Review</h2>
            <p className="text-primary-100 text-lg mb-8">
              Discover your spending personality, habits, and achievements in this year's Money Wrapped.
            </p>
            <Button 
              className="bg-white hover:bg-white/90 text-primary-700 font-medium px-8 py-6 rounded-lg text-lg"
              onClick={goToNextPage}
            >
              Let's Start <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Spending Identity Page */}
        {currentPage === 1 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Your Spending Identity</h2>
              <p className="text-primary-200 text-lg">Based on your {monthName} spending habits</p>
            </div>
            
            <div className="flex items-center justify-center mb-8">
              <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center p-3 animate-bounce-slow">
                <div className="w-full h-full rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-6xl">{identityEmoji}</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-4xl font-bold text-white text-center mb-5">{identity}</h3>
            
            <p className="text-center text-primary-100 text-lg mb-8">
              You spent the most on {insights?.topCategory || "shopping"} this month, 
              with {insights?.topCount || 8} {insights?.topCategory === "food" ? "orders" : "shopping trips"}!
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-primary-200 text-sm mb-1">Most spent on</p>
                <div className="flex items-center">
                  <span className="text-3xl mr-2">
                    {insights?.topCategory === "food" ? "🍔" : 
                     insights?.topCategory === "entertainment" ? "🎮" : "👗"}
                  </span>
                  <span className="text-white font-medium text-xl capitalize">{insights?.topCategory || "Fashion"}</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-primary-200 text-sm mb-1">Total spent</p>
                <p className="text-white font-medium text-xl">
                  ₹{insights?.totalSpending?.toLocaleString() || "20,900"}
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-primary-200 text-sm mb-1">
                  {insights?.topCategory === "food" ? "Food orders" : "Shopping trips"}
                </p>
                <p className="text-white font-medium text-xl">{insights?.transactionCount || 8} times</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-primary-200 text-sm mb-1">Biggest splurge</p>
                <p className="text-white font-medium text-xl">₹{insights?.biggestSpend?.toLocaleString() || "2,999"}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Spending Breakdown Page */}
        {currentPage === 2 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Spending Breakdown</h2>
            
            <div className="mb-8">
              {insights?.spendingByCategory ? (
                Object.entries(insights.spendingByCategory).map(([category, amount]: [string, any], index) => {
                  // Calculate percentage of total spending
                  const percentage = Math.round((amount / insights.totalSpending) * 100);
                  
                  // Determine progress bar color
                  const colorClass = index === 0 ? "bg-secondary" : 
                                    index === 1 ? "bg-yellow-400" : 
                                    index === 2 ? "bg-blue-400" : "bg-red-400";
                  
                  // Determine category emoji
                  const categoryEmoji = 
                    category === "food" ? "🍔" :
                    category === "shopping" ? "🛍️" :
                    category === "entertainment" ? "🎮" :
                    category === "bills" ? "📱" :
                    category === "transport" ? "🚗" : "💰";
                  
                  return (
                    <div key={category} className="mb-5 animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                      <div className="flex justify-between mb-2 items-center">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{categoryEmoji}</span>
                          <span className="text-primary-100 capitalize text-lg">{category}</span>
                        </div>
                        <span className="text-white font-medium">₹{amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 mb-1">
                        <div className={`${colorClass} h-3 rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="text-right text-sm text-primary-200">{percentage}%</div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="mb-5 animate-fade-in">
                    <div className="flex justify-between mb-2 items-center">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🛍️</span>
                        <span className="text-primary-100 text-lg">Fashion</span>
                      </div>
                      <span className="text-white font-medium">₹8,500</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 mb-1">
                      <div className="bg-secondary h-3 rounded-full transition-all duration-1000" style={{ width: "40%" }}></div>
                    </div>
                    <div className="text-right text-sm text-primary-200">40%</div>
                  </div>
                  
                  <div className="mb-5 animate-fade-in" style={{animationDelay: "0.2s"}}>
                    <div className="flex justify-between mb-2 items-center">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🍔</span>
                        <span className="text-primary-100 text-lg">Food Delivery</span>
                      </div>
                      <span className="text-white font-medium">₹6,200</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 mb-1">
                      <div className="bg-yellow-400 h-3 rounded-full transition-all duration-1000" style={{ width: "30%" }}></div>
                    </div>
                    <div className="text-right text-sm text-primary-200">30%</div>
                  </div>
                  
                  <div className="mb-5 animate-fade-in" style={{animationDelay: "0.4s"}}>
                    <div className="flex justify-between mb-2 items-center">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🎮</span>
                        <span className="text-primary-100 text-lg">Entertainment</span>
                      </div>
                      <span className="text-white font-medium">₹4,100</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 mb-1">
                      <div className="bg-blue-400 h-3 rounded-full transition-all duration-1000" style={{ width: "20%" }}></div>
                    </div>
                    <div className="text-right text-sm text-primary-200">20%</div>
                  </div>
                  
                  <div className="mb-5 animate-fade-in" style={{animationDelay: "0.6s"}}>
                    <div className="flex justify-between mb-2 items-center">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">💰</span>
                        <span className="text-primary-100 text-lg">Other</span>
                      </div>
                      <span className="text-white font-medium">₹2,100</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 mb-1">
                      <div className="bg-red-400 h-3 rounded-full transition-all duration-1000" style={{ width: "10%" }}></div>
                    </div>
                    <div className="text-right text-sm text-primary-200">10%</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Savings Progress Page */}
        {currentPage === 3 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Savings Progress</h2>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium text-xl">Your Savings</h3>
                <span className="bg-green-500/20 text-green-300 text-sm px-3 py-1 rounded-full">+15% vs Last Month</span>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-white mb-1">
                  ₹{insights?.totalSaving?.toLocaleString() || "3,200"}
                </div>
                <p className="text-primary-200">Saved this month</p>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-4 mb-2">
                <div className="bg-green-500 h-4 rounded-full transition-all duration-1500" style={{ width: "18%" }}></div>
              </div>
              <div className="flex justify-between text-sm text-primary-200">
                <span>Current</span>
                <span>₹18,000 goal</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-3">Savings Tip</h3>
              <p className="text-primary-100 mb-4">
                Set up automatic transfers to your savings account on payday to save before you spend.
              </p>
              <p className="text-primary-100 mb-4">
                The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and saving 20% of your income.
              </p>
            </div>
          </div>
        )}
        
        {/* Next Month Challenge Page */}
        {currentPage === 4 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Next Month's Challenge</h2>
            <p className="text-primary-100 text-lg mb-6">Based on your spending habits, here's a challenge for next month:</p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-3xl">{challengeEmoji}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-2xl">{challengeTitle}</h3>
                  <p className="text-primary-200 text-lg">{challengeDesc}</p>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-5 mb-6">
                <h4 className="text-white font-medium mb-2">Potential Savings</h4>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  ₹{estimatedSaving.toLocaleString()}
                </div>
                <p className="text-primary-200">
                  That's {Math.round((estimatedSaving / (insights?.totalSpending || 20900)) * 100)}% of your monthly spending!
                </p>
              </div>
              
              <Button className="w-full py-3 bg-white hover:bg-white/90 text-primary-700 font-medium text-lg rounded-lg">
                Accept Challenge
              </Button>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-3">Thanks for viewing your Money Wrapped!</h3>
              <p className="text-primary-100">
                We hope this helps you gain insights into your financial habits.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-between">
        {currentPage > 0 ? (
          <Button
            variant="outline"
            className="bg-white/10 border-0 text-white hover:bg-white/20 hover:text-white"
            onClick={goToPrevPage}
          >
            <ChevronLeft className="mr-1 h-5 w-5" /> Back
          </Button>
        ) : (
          <div></div> // Spacer
        )}
        
        {currentPage < pages.length - 1 ? (
          <Button
            className="bg-white text-primary-700 hover:bg-white/90"
            onClick={goToNextPage}
          >
            Next <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        ) : (
          <Button
            className="bg-white text-primary-700 hover:bg-white/90"
            onClick={() => navigate("/dashboard")}
          >
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}