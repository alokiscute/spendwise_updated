import { useState, useEffect } from "react";
import { useSpending } from "@/contexts/SpendingContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { X, ShoppingBag, Utensils, CreditCard, Heart, ThumbsUp, ThumbsDown } from "lucide-react";
import { type Goal } from "@shared/schema";

export default function SpendingNudge() {
  const { showNudge, setShowNudge, currentMerchant } = useSpending();
  const [isAppeared, setIsAppeared] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Get the primary goal for the user
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
    retry: false,
    enabled: showNudge,
  });
  
  const primaryGoal = goals.find((goal) => goal.isPrimary) || goals[0];
  
  useEffect(() => {
    if (showNudge) {
      setIsAppeared(true);
      
      // Auto-hide nudge after 15 seconds
      const timer = setTimeout(() => {
        setShowNudge(false);
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [showNudge, setShowNudge]);
  
  // Animation to fade out
  useEffect(() => {
    if (!showNudge && isAppeared) {
      const timer = setTimeout(() => {
        setIsAppeared(false);
      }, 400);
      
      return () => clearTimeout(timer);
    }
  }, [showNudge, isAppeared]);
  
  if (!isAppeared) return null;
  
  // Get the merchant icon
  const getMerchantIcon = () => {
    if (currentMerchant === "Zomato" || currentMerchant === "Swiggy") {
      return <Utensils className="h-6 w-6" />;
    } else if (currentMerchant === "Amazon" || currentMerchant === "Myntra") {
      return <ShoppingBag className="h-6 w-6" />;
    } else {
      return <CreditCard className="h-6 w-6" />;
    }
  };
  
  // Calculate potential savings (random amount between 200-500)
  const potentialSaving = Math.floor(Math.random() * 300) + 200;
  
  // Calculate percentage with potential saving added
  const currentPercentage = primaryGoal ? 
    (primaryGoal.currentAmount / primaryGoal.targetAmount) * 100 : 25;
    
  const potentialPercentage = primaryGoal ? 
    ((primaryGoal.currentAmount + potentialSaving) / primaryGoal.targetAmount) * 100 - currentPercentage : 3;

  // Handle save choice
  const handleSaveChoice = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowNudge(false);
    }, 1000);
  };
  
  return (
    <div className={`fixed inset-0 bg-black/70 flex items-end justify-center z-50 transition-all duration-300 ${showNudge ? "opacity-100" : "opacity-0"}`}>
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 3 + 1}s linear forwards`,
                opacity: Math.random() * 0.5 + 0.5,
                transform: `scale(${Math.random() * 0.4 + 0.6})`,
              }}
            >
              <span className="text-2xl" style={{ color: `hsl(${Math.random() * 360}, 90%, 70%)` }}>
                {['🎉', '💰', '✨', '💸', '🔥', '👑'][Math.floor(Math.random() * 6)]}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="w-full max-w-md bg-gradient-to-b from-white to-[#fcf9ff] rounded-t-3xl p-6 shadow-lg animate-in slide-in-from-bottom duration-300">
        <div className="absolute right-4 top-4">
          <button 
            onClick={() => setShowNudge(false)}
            className="rounded-full p-1 hover:bg-muted/80 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="flex flex-col space-y-5">
          <div className="flex gap-4 items-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <div className="text-primary h-8 w-8">
                {getMerchantIcon()}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold">
                Ready to spend at {currentMerchant}?
              </h3>
              <p className="text-muted-foreground">let's vibe check this purchase</p>
            </div>
          </div>
          
          <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👀</span>
              <p className="text-sm text-pink-800">
                You've already spent <span className="font-semibold">₹2,600</span> on 
                {currentMerchant === "Zomato" || currentMerchant === "Swiggy" 
                  ? " food this month" 
                  : " shopping this month"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-16 rounded-xl bubble group relative overflow-hidden border-muted-foreground/20 hover:border-muted-foreground/30"
              onClick={() => setShowNudge(false)}
            >
              <div className="flex flex-col items-center gap-1">
                <ThumbsDown className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="font-semibold">I'm Buying</span>
              </div>
            </Button>
            
            <Button 
              className="h-16 rounded-xl bubble button-glow bg-gradient-to-r from-indigo-500 to-primary"
              onClick={handleSaveChoice}
            >
              <div className="flex flex-col items-center gap-1">
                <Heart className="h-5 w-5 text-white" />
                <span className="font-semibold">I'll Save</span>
              </div>
            </Button>
          </div>
          
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="emoji-float text-lg">💰</span>
                <span className="font-semibold">Save ₹{potentialSaving} today</span>
              </div>
              
              {primaryGoal && (
                <div className="px-2 py-1 bg-primary/10 rounded-full">
                  <span className="text-xs text-primary font-medium">{primaryGoal.name}</span>
                </div>
              )}
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                    Progress
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary">
                    {Math.round(currentPercentage)}%
                  </span>
                </div>
              </div>
              
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-primary/10">
                <div style={{ width: `${currentPercentage}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500">
                </div>
              </div>
              
              <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-primary/10 -mt-6 opacity-30">
                <div style={{ width: `${currentPercentage + potentialPercentage}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500">
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                {primaryGoal && (
                  <>
                    <span>₹{primaryGoal.currentAmount.toLocaleString()} saved</span>
                    <span>Goal: ₹{primaryGoal.targetAmount.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              Swipe down to dismiss
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
