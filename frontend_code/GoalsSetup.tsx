import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRight, Sparkles, Medal, 
  Headphones, Gift, Home, Plane,
  Shirt, PiggyBank, Gem, Plus, Trash2
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const goalSchema = z.object({
  name: z.string().min(1, "Required"),
  emoji: z.string().min(1, "Required"),
  targetAmount: z.coerce.number().min(1, "Must be at least 1"),
  dueDate: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

type GoalFormData = z.infer<typeof goalSchema>;

const SUGGESTED_GOALS = [
  { name: "Emergency Fund", emoji: "🔒", targetAmount: 50000 },
  { name: "New Phone", emoji: "📱", targetAmount: 15000 },
  { name: "Trip to Goa", emoji: "🏝️", targetAmount: 20000 },
  { name: "Gaming Console", emoji: "🎮", targetAmount: 40000 },
  { name: "New Outfit", emoji: "👔", targetAmount: 5000 },
  { name: "Concert Tickets", emoji: "🎵", targetAmount: 4000 },
];

const EMOJI_OPTIONS = [
  "💰", "🏠", "🚗", "📱", "💻", "👔", "👟", "🎮", "🎧", "🏝️", 
  "✈️", "🎓", "🎁", "💍", "⌚", "🎨", "🏋️", "🎸", "📚", "🐶"
];

export default function GoalsSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedGoals, setSelectedGoals] = useState<GoalFormData[]>([]);
  const [currentStep, setCurrentStep] = useState('select'); // 'select', 'customize', 'done'
  const [customizing, setCustomizing] = useState<GoalFormData | null>(null);
  const [animation, setAnimation] = useState(false);

  // Get the budget to recommend savings
  const { data: budget } = useQuery({
    queryKey: ['/api/budget'],
    retry: false,
  });

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      emoji: "💰",
      targetAmount: 10000,
      isPrimary: false,
    },
  });

  const createGoalsMutation = useMutation({
    mutationFn: async () => {
      // Create each goal in the selected goals array
      for (const goal of selectedGoals) {
        await apiRequest("POST", "/api/goals", goal);
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setAnimation(true);
      setTimeout(() => {
        navigate("/connect-spending");
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Oops! Something went wrong",
        description: "Couldn't save your goals. Please try again!",
        variant: "destructive",
      });
    },
  });

  function handleSelectSuggested(goal: typeof SUGGESTED_GOALS[0]) {
    // Make sure we don't already have this goal
    if (!selectedGoals.some(g => g.name === goal.name)) {
      setSelectedGoals([...selectedGoals, {
        name: goal.name,
        emoji: goal.emoji,
        targetAmount: goal.targetAmount,
        isPrimary: selectedGoals.length === 0, // First goal is primary by default
      }]);
    }
  }

  function handleRemoveGoal(index: number) {
    const newGoals = [...selectedGoals];
    const removedGoal = newGoals.splice(index, 1)[0];
    
    // If we removed the primary goal, make the first remaining goal primary
    if (removedGoal.isPrimary && newGoals.length > 0) {
      newGoals[0].isPrimary = true;
    }
    
    setSelectedGoals(newGoals);
  }

  function handleSetPrimary(index: number) {
    // Update all goals to not be primary, then set the selected one to primary
    const newGoals = selectedGoals.map((goal, i) => ({
      ...goal,
      isPrimary: i === index
    }));
    
    setSelectedGoals(newGoals);
  }

  function handleCustomizeGoal(goal?: GoalFormData) {
    if (goal) {
      form.reset(goal);
      setCustomizing(goal);
    } else {
      form.reset({
        name: "",
        emoji: "💰",
        targetAmount: 10000,
        isPrimary: selectedGoals.length === 0,
      });
      setCustomizing(null);
    }
    setCurrentStep('customize');
  }

  function onSubmitCustomGoal(data: GoalFormData) {
    if (customizing) {
      // Update existing goal
      const newGoals = selectedGoals.map(g => 
        g === customizing ? data : g.isPrimary && data.isPrimary ? {...g, isPrimary: false} : g
      );
      setSelectedGoals(newGoals);
    } else {
      // Add new goal
      // If this is marked as primary, update other goals
      const newGoals = data.isPrimary 
        ? selectedGoals.map(g => ({...g, isPrimary: false})) 
        : [...selectedGoals];
      
      setSelectedGoals([...newGoals, data]);
    }
    setCurrentStep('select');
  }

  function handleFinish() {
    if (selectedGoals.length === 0) {
      toast({
        title: "No goals selected",
        description: "Please select at least one savings goal!",
        variant: "destructive",
      });
      return;
    }
    
    createGoalsMutation.mutate();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden py-8 px-4">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-24 translate-x-16 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full translate-y-24 -translate-x-16 blur-3xl"></div>
      
      {animation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-300">
            <Sparkles className="h-16 w-16 text-primary mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold gradient-text">Goals Set!</h3>
            <p className="text-muted-foreground">You're on your way to financial freedom!</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">Set Your Goals</h1>
          <p className="text-muted-foreground">What are you saving for?</p>
        </div>
        
        {currentStep === 'select' && (
          <div className="space-y-6">
            {selectedGoals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center">
                  <Medal className="h-5 w-5 mr-2 text-primary" />
                  Your Goals
                </h2>
                <div className="grid gap-3">
                  {selectedGoals.map((goal, index) => (
                    <Card key={index} className={`card-hover ${goal.isPrimary ? 'border-primary border-2' : ''}`}>
                      <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2 emoji-float">{goal.emoji}</span>
                          <CardTitle className="text-base">{goal.name}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-1">
                          {goal.isPrimary && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                              Primary
                            </Badge>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-destructive/10"
                            onClick={() => handleRemoveGoal(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground">
                          ₹{goal.targetAmount.toLocaleString()}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs flex-1 rounded-lg"
                          onClick={() => handleCustomizeGoal(goal)}
                        >
                          Edit
                        </Button>
                        {!goal.isPrimary && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs flex-1 rounded-lg text-primary"
                            onClick={() => handleSetPrimary(index)}
                          >
                            Make Primary
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Suggested Goals
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {SUGGESTED_GOALS.map((goal, index) => (
                  <Card 
                    key={index} 
                    className={`card-hover cursor-pointer transition-all ${
                      selectedGoals.some(g => g.name === goal.name) ? 'opacity-50' : ''
                    }`}
                    onClick={() => handleSelectSuggested(goal)}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <span className="text-3xl mb-2 emoji-float">{goal.emoji}</span>
                      <CardTitle className="text-sm">{goal.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        ₹{goal.targetAmount.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                <Card 
                  className="card-hover cursor-pointer border-dashed border-2"
                  onClick={() => handleCustomizeGoal()}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full mb-2">
                      <Plus className="h-6 w-6 text-primary" />
                    </Button>
                    <CardTitle className="text-sm">Add Custom Goal</CardTitle>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleFinish}
                className="w-full h-12 rounded-xl font-semibold bubble button-glow flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-primary"
                disabled={createGoalsMutation.isPending}
              >
                {createGoalsMutation.isPending ? (
                  "Saving Goals..."
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 'customize' && (
          <div className="bg-white rounded-3xl p-6 shadow-lg card-hover">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitCustomGoal)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="emoji"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Choose an icon</FormLabel>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {EMOJI_OPTIONS.map((emoji, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            className={`h-12 w-12 text-xl rounded-xl p-0 ${
                              field.value === emoji 
                                ? 'bg-primary/10 border-primary text-primary' 
                                : ''
                            }`}
                            onClick={() => form.setValue("emoji", emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Goal Name</FormLabel>
                      <FormControl>
                        <Input
                          className="h-12 rounded-xl"
                          placeholder="e.g., New Laptop"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Target Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            className="pl-8 h-12 rounded-xl text-base"
                            type="number"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Primary Goal</FormLabel>
                        <FormDescription className="text-xs">
                          Your main savings focus. This goal will appear on your dashboard.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="peer sr-only"
                        />
                      </FormControl>
                      <div className={`
                        ml-0 h-6 w-11 flex-shrink-0 rounded-full 
                        ${field.value ? 'bg-primary' : 'bg-muted'} 
                        transition-colors 
                        after:absolute after:left-[2px] after:top-[2px] 
                        after:h-5 after:w-5 
                        after:rounded-full after:bg-white after:shadow-sm 
                        after:transition-transform 
                        ${field.value ? 'after:translate-x-5' : ''}
                        relative
                      `} />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-xl font-semibold"
                    onClick={() => setCurrentStep('select')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 rounded-xl font-semibold bubble button-glow"
                  >
                    Save Goal
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}