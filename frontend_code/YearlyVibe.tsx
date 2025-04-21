import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Goal } from "@shared/schema";

export default function YearlyVibe() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch user's goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['/api/goals'],
    retry: false,
  });
  
  // Mutation for adding a new goal
  const addGoalMutation = useMutation({
    mutationFn: (goal: Partial<Goal>) => {
      return apiRequest("POST", "/api/goals", goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
    },
  });
  
  const handleAddGoal = () => {
    // This would typically open a modal for goal creation
    toast({
      title: "Feature Coming Soon",
      description: "Adding a new goal will be available soon.",
    });
  };
  
  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real app, we might want to mark onboarding as complete in user profile
      
      // Navigate to the main dashboard
      navigate("/");
      
      toast({
        title: "Setup Complete!",
        description: "Your financial goals are all set. Let's start saving!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-40 flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-white z-40">
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Set Your Yearly Vibe</h1>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">3/3</span>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full">
              <div className="w-full h-full bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Tell us who you wanna be this year!</h2>
            <p className="text-gray-600">Pick up to 5 financial goals that match your vibe.</p>
          </div>
          
          <div className="mb-8">
            {goals.map((goal: Goal, index: number) => {
              const backgroundColor = index === 0 ? "bg-primary-50" : 
                                    index === 1 ? "bg-secondary-50" : 
                                    "bg-accent-50/50";
              const borderColor = index === 0 ? "border-primary-200" : 
                                index === 1 ? "border-secondary-200" : 
                                "border-accent-200/50";
              const badgeColor = index === 0 ? "bg-primary" : 
                               index === 1 ? "bg-secondary-500" : 
                               "bg-accent-500";
              const progressColor = index === 0 ? "primary" : 
                                   index === 1 ? "secondary" : 
                                   "accent";
              
              // Calculate completion percentage
              const percentage = goal.targetAmount > 0 
                ? Math.round((goal.currentAmount / goal.targetAmount) * 100) 
                : 0;
              
              return (
                <div key={index} className={`${backgroundColor} border ${borderColor} rounded-lg p-4 mb-4 relative`}>
                  <div className="absolute -top-3 -right-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full ${badgeColor} text-white text-xs">{index + 1}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{goal.emoji}</span>
                      <h3 className="font-medium">{goal.name}</h3>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="ri-edit-line"></i>
                    </button>
                  </div>
                  <div className="mb-2">
                    <Progress value={percentage} variant={progressColor} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {goal.targetAmount > 0 ? (
                      <>
                        <span className="text-gray-600">₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</span>
                        <span className={`text-${progressColor === "primary" ? "primary" : progressColor === "secondary" ? "secondary-500" : "accent-500"} font-medium`}>
                          {percentage}% saved
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-600">Goal: 20% reduction</span>
                        <span className={`text-${progressColor === "primary" ? "primary" : progressColor === "secondary" ? "secondary-500" : "accent-500"} font-medium`}>
                          Just started!
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            <button 
              className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
              onClick={handleAddGoal}
            >
              <i className="ri-add-line"></i>
              <span>Add another goal</span>
            </button>
          </div>
        </div>
        
        <Button 
          className="bg-primary text-white font-medium p-4 rounded-lg w-full mb-4"
          onClick={handleComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Setting up..." : "Start Saving!"}
        </Button>
      </div>
    </div>
  );
}
