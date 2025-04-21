import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Trophy, Timer, Target, Plus, Calendar, Sparkles,
  CheckCircle, Clock, Award, BadgeCheck, ShieldCheck, Rocket
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Challenge schema
const challengeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targetAmount: z.number().min(100, "Target amount must be at least ₹100"),
  startDate: z.date(),
  endDate: z.date()
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

// Badge component
function BadgeItem({ name, isUnlocked, icon: Icon }: { 
  name: string; 
  isUnlocked: boolean;
  icon: React.ElementType;
}) {
  return (
    <div className={`flex flex-col items-center p-3 rounded-lg ${
      isUnlocked 
        ? 'bg-primary/10 border-primary/20' 
        : 'bg-muted/50 border-muted-foreground/20'
    } border`}>
      <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${
        isUnlocked 
          ? 'bg-primary/20 text-primary' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className={`text-xs font-medium text-center ${
        isUnlocked ? '' : 'text-muted-foreground'
      }`}>
        {name}
      </span>
      {isUnlocked && (
        <Badge variant="secondary" className="mt-1 text-[10px]">
          <BadgeCheck className="h-3 w-3 mr-1" />
          Unlocked
        </Badge>
      )}
    </div>
  );
}

// Challenge Form component
function ChallengeForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: ChallengeFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: "",
      description: "",
      targetAmount: 1000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge Title</FormLabel>
              <FormControl>
                <Input placeholder="Weekly Coffee Savings" {...field} />
              </FormControl>
              <FormDescription>
                Give your savings challenge a motivating title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Skip my daily cafe coffee and save money for vacation" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Describe what you're saving for and how you'll achieve it
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Amount (₹{field.value.toLocaleString()})</FormLabel>
              <FormControl>
                <Slider
                  min={100}
                  max={50000}
                  step={100}
                  value={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                />
              </FormControl>
              <FormDescription>
                How much do you want to save with this challenge?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= form.getValues().startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Challenge</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Add Savings Form component
function AddSavingsForm({ 
  challengeId,
  onSubmit,
  onCancel
}: { 
  challengeId: number;
  onSubmit: (data: { amount: number }) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(500);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ amount });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Amount to Add (₹{amount.toLocaleString()})
        </label>
        <Slider
          min={100}
          max={10000}
          step={100}
          value={[amount]}
          onValueChange={(vals) => setAmount(vals[0])}
        />
        <p className="text-sm text-muted-foreground">
          How much do you want to add to this challenge?
        </p>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Savings</Button>
      </DialogFooter>
    </form>
  );
}

// Main component for savings challenges
export default function SavingsChallenges() {
  const { toast } = useToast();
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);

  // Fetch challenges
  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ["/api/savings-challenges"],
  });

  // Fetch badges
  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ["/api/badges"],
  });

  // Get savings suggestion
  const { data: suggestion } = useQuery({
    queryKey: ["/api/savings-suggestion"],
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
  });

  // Create challenge mutation
  const createMutation = useMutation({
    mutationFn: async (data: ChallengeFormValues) => {
      const res = await apiRequest("POST", "/api/savings-challenges", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-challenges"] });
      setIsCreatingChallenge(false);
      toast({
        title: "Challenge Created",
        description: "Your savings challenge has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add savings mutation
  const addSavingsMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      const res = await apiRequest("POST", `/api/savings-challenges/${id}/add-savings`, { amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-challenges"] });
      setSelectedChallenge(null);
      toast({
        title: "Savings Added",
        description: "Your savings have been added successfully.",
      });
      
      // Also invalidate badges to refresh if any were unlocked
      queryClient.invalidateQueries({ queryKey: ["/api/badges"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Savings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (data: ChallengeFormValues) => {
    createMutation.mutate(data);
  };

  // Handle adding savings
  const handleAddSavings = ({ amount }: { amount: number }) => {
    if (selectedChallenge !== null) {
      addSavingsMutation.mutate({ id: selectedChallenge, amount });
    }
  };

  // Get active and completed challenges
  const activeChallengees = Array.isArray(challenges) 
    ? challenges.filter(challenge => !challenge.isCompleted)
    : [];
  
  const completedChallenges = Array.isArray(challenges) 
    ? challenges.filter(challenge => challenge.isCompleted)
    : [];

  // Badge icons mapping
  const badgeIcons: Record<string, React.ElementType> = {
    "Weekly Warrior": Trophy,
    "Coffee Conqueror": ShieldCheck,
    "Shopping Stopper": Target,
    "Emergency Master": Rocket,
    "Saving Streak": TrendingUp,
    "Budget Master": Award,
    "Goal Achiever": CheckCircle,
    "Smart Saver": Sparkles,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Savings Challenges</h2>
          <p className="text-muted-foreground">
            Gamify your savings with fun challenges and earn badges
          </p>
        </div>
        <Dialog open={isCreatingChallenge} onOpenChange={setIsCreatingChallenge}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Savings Challenge</DialogTitle>
              <DialogDescription>
                Set up a savings challenge to help you reach your financial goals.
              </DialogDescription>
            </DialogHeader>
            <ChallengeForm 
              onSubmit={handleSubmit} 
              onCancel={() => setIsCreatingChallenge(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {suggestion && (
        <Card className="bg-gradient-to-r from-indigo-500/10 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Savings Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{suggestion.suggestion}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={() => setIsCreatingChallenge(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create This Challenge
            </Button>
          </CardFooter>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Your Badges</h3>
        {badgesLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : badges && badges.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {badges.map(badge => (
              <BadgeItem 
                key={badge.id} 
                name={badge.name} 
                isUnlocked={badge.earned} 
                icon={badgeIcons[badge.name] || Trophy} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-muted rounded-lg mb-6">
            <Award className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Complete savings challenges to earn badges
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Active Challenges</h3>
        {challengesLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activeChallengees.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeChallengees.map(challenge => {
              const progress = challenge.targetAmount > 0 
                ? (challenge.currentAmount / challenge.targetAmount) * 100 
                : 0;
              
              const daysLeft = Math.ceil(
                (new Date(challenge.endDate).getTime() - new Date().getTime()) / 
                (1000 * 60 * 60 * 24)
              );
              
              return (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {daysLeft} days left
                      </Badge>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            ₹{challenge.currentAmount.toLocaleString()} of ₹{challenge.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Started: {format(new Date(challenge.startDate), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Timer className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Ends: {format(new Date(challenge.endDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedChallenge(challenge.id)}
                    >
                      Add Savings
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-muted rounded-lg mb-6">
            <Target className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">
              You don't have any active challenges
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsCreatingChallenge(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create a Challenge
            </Button>
          </div>
        )}
      </div>

      {completedChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Completed Challenges</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {completedChallenges.map(challenge => (
              <Card key={challenge.id} className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Saved</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          ₹{challenge.currentAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={100} className="h-2 bg-green-100 dark:bg-green-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Started: {format(new Date(challenge.startDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-muted-foreground">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Savings Dialog */}
      {selectedChallenge !== null && (
        <Dialog 
          open={selectedChallenge !== null} 
          onOpenChange={(open) => !open && setSelectedChallenge(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Savings</DialogTitle>
              <DialogDescription>
                Add money to your savings challenge and get closer to your goal.
              </DialogDescription>
            </DialogHeader>
            <AddSavingsForm 
              challengeId={selectedChallenge} 
              onSubmit={handleAddSavings}
              onCancel={() => setSelectedChallenge(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}