import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { type Goal } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface GoalCardProps {
  goal: Goal;
  variant?: "default" | "compact";
  isPrimary?: boolean;
}

export function GoalCard({ goal, variant = "default", isPrimary = false }: GoalCardProps) {
  // Calculate completion percentage
  const percentage = goal.targetAmount > 0 
    ? Math.round((goal.currentAmount / goal.targetAmount) * 100) 
    : 0;
  
  // Mutation for updating a goal
  const updateGoalMutation = useMutation({
    mutationFn: (updates: Partial<Goal>) => {
      return apiRequest("PATCH", `/api/goals/${goal.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
    },
  });
  
  const handleAddFunds = () => {
    // In a real app, this would open a modal to add funds to the goal
    updateGoalMutation.mutate({
      currentAmount: goal.currentAmount + 1000 // Adding mock 1000 for demo
    });
  };
  
  if (variant === "compact") {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{goal.emoji}</span>
            <h3 className="font-medium">{goal.name}</h3>
          </div>
          {isPrimary && (
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">Top Goal</span>
          )}
        </div>
        <div className="mb-2">
          <Progress value={percentage} variant="primary" />
        </div>
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-600">
            ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
          </span>
          <span className="text-primary font-medium">{percentage}%</span>
        </div>
        <Button 
          variant={isPrimary ? "default" : "outline"} 
          className={`w-full py-2 ${isPrimary ? "bg-primary" : "border-primary"} rounded-lg ${isPrimary ? "text-white" : "text-primary"} text-sm font-medium`}
          onClick={handleAddFunds}
          disabled={updateGoalMutation.isPending}
        >
          {updateGoalMutation.isPending ? "Updating..." : "Add Funds"}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{goal.emoji}</span>
          <h3 className="font-medium">{goal.name}</h3>
        </div>
        {isPrimary && (
          <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">Top Goal</span>
        )}
      </div>
      <div className="mb-2">
        <Progress value={percentage} variant="primary" />
      </div>
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-600">
          ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
        </span>
        <span className="text-primary font-medium">{percentage}%</span>
      </div>
      <Button 
        variant={isPrimary ? "default" : "outline"} 
        className={`w-full py-2 ${isPrimary ? "bg-primary" : "border-primary"} rounded-lg ${isPrimary ? "text-white" : "text-primary"} text-sm font-medium`}
        onClick={handleAddFunds}
        disabled={updateGoalMutation.isPending}
      >
        {updateGoalMutation.isPending ? "Updating..." : "Add Funds"}
      </Button>
    </div>
  );
}
