import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GoalCard } from "@/components/ui/goal-card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@shared/schema";

export default function Goals() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    emoji: "💰",
    targetAmount: 0,
    currentAmount: 0,
    isPrimary: false
  });
  
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
      setIsAddDialogOpen(false);
      setNewGoal({
        name: "",
        emoji: "💰",
        targetAmount: 0,
        currentAmount: 0,
        isPrimary: false
      });
      toast({
        title: "Goal Added",
        description: "Your new savings goal has been added!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add goal: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });
  
  // Emoji options for goal creation
  const emojiOptions = ["💰", "🎧", "✈️", "🏠", "🚗", "💻", "👗", "📱", "🎮", "📚", "💍", "🎁"];
  
  const handleSubmit = () => {
    if (!newGoal.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a goal name",
        variant: "destructive",
      });
      return;
    }
    
    if (newGoal.targetAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid target amount",
        variant: "destructive",
      });
      return;
    }
    
    addGoalMutation.mutate(newGoal);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Savings Goals</h1>
        <p className="text-gray-500">Track and manage your financial targets</p>
      </header>
      
      <div className="grid grid-cols-1 gap-4 mb-6">
        {goals.map((goal: Goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
      
      <Button 
        className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-lg"
        onClick={() => setIsAddDialogOpen(true)}
      >
        <i className="ri-add-line"></i>
        <span>Add New Goal</span>
      </Button>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Savings Goal</DialogTitle>
            <DialogDescription>
              Set a new financial target to save towards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="mb-4">
              <Label htmlFor="emoji" className="block mb-2">Choose an emoji</Label>
              <div className="grid grid-cols-6 gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`p-2 text-xl rounded-md ${newGoal.emoji === emoji ? 'bg-primary-100 border border-primary' : 'bg-gray-100'}`}
                    onClick={() => setNewGoal({ ...newGoal, emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="name" className="block mb-2">Goal Name</Label>
              <Input
                id="name"
                placeholder="e.g., New Headphones"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="targetAmount" className="block mb-2">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="e.g., 10000"
                value={newGoal.targetAmount || ''}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <Label htmlFor="currentAmount" className="block mb-2">Initial Savings (₹)</Label>
              <Input
                id="currentAmount"
                type="number"
                placeholder="e.g., 1000"
                value={newGoal.currentAmount || ''}
                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                id="isPrimary"
                type="checkbox"
                className="h-4 w-4 text-primary rounded"
                checked={newGoal.isPrimary}
                onChange={(e) => setNewGoal({ ...newGoal, isPrimary: e.target.checked })}
              />
              <Label htmlFor="isPrimary">Make this my primary goal</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={addGoalMutation.isPending}
            >
              {addGoalMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
