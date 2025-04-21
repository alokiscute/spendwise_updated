import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, CircleDollarSign, Goal, Calendar, ChevronRight, ChevronLeft, UserCircle, BadgePercent, Briefcase, Heart, ShoppingBag } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { AvatarSelection } from "@/components/ui/avatar-selection";
import { Progress } from "@/components/ui/progress";

const personalInfoSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  nickname: z.string().min(2, {
    message: "Nickname must be at least 2 characters.",
  }),
  avatarType: z.enum(["funny", "serious", "chill"]),
  ageRange: z.enum(["18-24", "25-30", "31-35", "36+"]),
});

const financialInfoSchema = z.object({
  monthlyIncome: z.coerce.number().min(1, {
    message: "Monthly income must be at least 1.",
  }),
  essentialsPercentage: z.coerce.number().min(0).max(100),
  foodPercentage: z.coerce.number().min(0).max(100),
  funPercentage: z.coerce.number().min(0).max(100),
  savingsPercentage: z.coerce.number().min(0).max(100),
});

const goalSchema = z.object({
  shortTermGoal: z.string().min(2, {
    message: "Short-term goal is required.",
  }),
  shortTermAmount: z.coerce.number().min(1),
  longTermGoal: z.string().min(2, {
    message: "Long-term goal is required.",
  }),
  longTermAmount: z.coerce.number().min(1),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;
type GoalFormData = z.infer<typeof goalSchema>;

const STEPS = ["Personal Info", "Financial Profile", "Your Goals", "Connect Apps"];

const SUGGESTED_GOALS = [
  {
    title: "Emergency Fund",
    description: "3-6 months of expenses saved for emergencies",
    icon: <Heart className="h-5 w-5" />,
    amount: 50000,
    category: "short"
  },
  {
    title: "New Phone",
    description: "Save for the latest smartphone",
    icon: <ShoppingBag className="h-5 w-5" />,
    amount: 15000,
    category: "short"
  },
  {
    title: "Travel Fund",
    description: "For your next vacation",
    icon: <Briefcase className="h-5 w-5" />,
    amount: 30000,
    category: "short"
  },
  {
    title: "Down Payment",
    description: "Save for a house down payment",
    icon: <BadgePercent className="h-5 w-5" />,
    amount: 500000,
    category: "long"
  }
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoFormData>({
    fullName: "",
    nickname: "",
    avatarType: "funny",
    ageRange: "18-24"
  });
  const [financialInfo, setFinancialInfo] = useState<FinancialInfoFormData>({
    monthlyIncome: 30000,
    essentialsPercentage: 50,
    foodPercentage: 20,
    funPercentage: 20,
    savingsPercentage: 10
  });
  const [goalInfo, setGoalInfo] = useState<GoalFormData>({
    shortTermGoal: "",
    shortTermAmount: 10000,
    longTermGoal: "",
    longTermAmount: 100000
  });
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const { toast } = useToast();

  const personalForm = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: personalInfo
  });

  const financialForm = useForm<FinancialInfoFormData>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: financialInfo
  });

  const goalForm = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: goalInfo
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/auth/me", data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update profile information.",
        variant: "destructive",
      });
    }
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/budget", data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to save budget information.",
        variant: "destructive",
      });
    }
  });

  const createGoalsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/goals", data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to save goals.",
        variant: "destructive",
      });
    }
  });

  const connectAppsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/connected-apps/batch", data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to connect apps.",
        variant: "destructive",
      });
    }
  });

  const handlePersonalInfoSubmit = (data: PersonalInfoFormData) => {
    setPersonalInfo(data);
    setCurrentStep(1);
  };

  const handleFinancialInfoSubmit = (data: FinancialInfoFormData) => {
    setFinancialInfo(data);
    setCurrentStep(2);
  };

  const handleGoalSubmit = (data: GoalFormData) => {
    setGoalInfo(data);
    setCurrentStep(3);
  };

  const toggleAppSelection = (appName: string) => {
    setSelectedApps(prev => 
      prev.includes(appName) 
        ? prev.filter(app => app !== appName) 
        : [...prev, appName]
    );
  };

  const finishOnboarding = async () => {
    try {
      // Save profile information
      await updateProfileMutation.mutateAsync({
        fullName: personalInfo.fullName,
        nickname: personalInfo.nickname,
        avatarType: personalInfo.avatarType,
        ageRange: personalInfo.ageRange
      });

      // Save budget information
      await createBudgetMutation.mutateAsync({
        monthlyBudget: financialInfo.monthlyIncome,
        essentialsPercentage: financialInfo.essentialsPercentage,
        foodPercentage: financialInfo.foodPercentage,
        funPercentage: financialInfo.funPercentage,
        treatsPercentage: financialInfo.savingsPercentage
      });

      // Create short-term goal
      if (goalInfo.shortTermGoal) {
        await createGoalsMutation.mutateAsync({
          name: goalInfo.shortTermGoal,
          targetAmount: goalInfo.shortTermAmount,
          currentAmount: 0,
          emoji: "🎯",
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isPrimary: true
        });
      }

      // Create long-term goal
      if (goalInfo.longTermGoal) {
        await createGoalsMutation.mutateAsync({
          name: goalInfo.longTermGoal,
          targetAmount: goalInfo.longTermAmount,
          currentAmount: 0,
          emoji: "🏆",
          deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isPrimary: false
        });
      }

      // Connect selected apps
      if (selectedApps.length > 0) {
        await connectAppsMutation.mutateAsync({
          apps: selectedApps.map(appName => ({
            appName,
            appType: ["Google Pay", "PhonePe", "Paytm"].includes(appName) ? "payment" : "shopping",
            connected: true
          }))
        });
      }

      toast({
        title: "Setup Complete!",
        description: "Your profile has been set up successfully.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error in setup:", error);
      toast({
        title: "Setup Failed",
        description: "There was an error setting up your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderAppOption = (appName: string, icon: React.ReactNode, type: string) => (
    <div 
      key={appName}
      onClick={() => toggleAppSelection(appName)}
      className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all ${
        selectedApps.includes(appName) 
          ? "border-primary bg-primary/5" 
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="mr-3 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{appName}</h3>
        <p className="text-xs text-muted-foreground capitalize">{type}</p>
      </div>
      <div className={`h-5 w-5 rounded-full border ${
        selectedApps.includes(appName) 
          ? "bg-primary border-primary" 
          : "border-gray-300"
      }`}>
        {selectedApps.includes(appName) && (
          <CheckCircle className="text-white" size={20} />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50 p-4">
      <div className="max-w-md w-full mb-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Setup Your Money Vibes 🎵</h1>
          <p className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
        </div>
        
        <Progress value={(currentStep + 1) / STEPS.length * 100} className="h-2 mb-8" />
        
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => (
            <div 
              key={step} 
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
              style={{ width: `${100 / STEPS.length}%` }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index < currentStep ? 'bg-primary text-white' : 
                index === currentStep ? 'border-2 border-primary' : 'border-2 border-muted'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="text-xs text-center">{step}</span>
            </div>
          ))}
        </div>
      </div>
      
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Tell us a bit about yourself"}
            {currentStep === 1 && "Set up your financial profile"}
            {currentStep === 2 && "What are you saving for?"}
            {currentStep === 3 && "Connect your favorite apps"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <Form {...personalForm}>
              <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-5">
                <FormField
                  control={personalForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={personalForm.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nickname</FormLabel>
                      <FormControl>
                        <Input placeholder="What should we call you?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={personalForm.control}
                  name="ageRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Range</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full p-2 border rounded-md"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="18-24">18-24 years</option>
                          <option value="25-30">25-30 years</option>
                          <option value="31-35">31-35 years</option>
                          <option value="36+">36+ years</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={personalForm.control}
                  name="avatarType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choose Your Vibe</FormLabel>
                      <FormControl>
                        <AvatarSelection 
                          selected={field.value} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end pt-4">
                  <Button type="submit">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}
          
          {/* Step 2: Financial Information */}
          {currentStep === 1 && (
            <Form {...financialForm}>
              <form onSubmit={financialForm.handleSubmit(handleFinancialInfoSubmit)} className="space-y-5">
                <FormField
                  control={financialForm.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your approximate monthly income after taxes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Budget Allocation</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Drag the sliders to allocate your monthly income
                  </p>
                  
                  <div className="space-y-6">
                    <FormField
                      control={financialForm.control}
                      name="essentialsPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-2">
                            <FormLabel>Essentials</FormLabel>
                            <span className="text-sm">{field.value}%</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Rent, utilities, transport, insurance
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={financialForm.control}
                      name="foodPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-2">
                            <FormLabel>Food</FormLabel>
                            <span className="text-sm">{field.value}%</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Groceries, dining out, food delivery
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={financialForm.control}
                      name="funPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-2">
                            <FormLabel>Fun & Entertainment</FormLabel>
                            <span className="text-sm">{field.value}%</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Shopping, entertainment, travel
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={financialForm.control}
                      name="savingsPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-2">
                            <FormLabel>Savings</FormLabel>
                            <span className="text-sm">{field.value}%</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            For goals, emergencies, and future
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-4 p-3 rounded-md bg-muted">
                    <div className="flex justify-between mb-2">
                      <span>Total allocation:</span>
                      <span className={`font-medium ${
                        financialForm.watch("essentialsPercentage") + 
                        financialForm.watch("foodPercentage") + 
                        financialForm.watch("funPercentage") + 
                        financialForm.watch("savingsPercentage") !== 100
                          ? "text-red-500" 
                          : "text-green-600"
                      }`}>
                        {financialForm.watch("essentialsPercentage") + 
                         financialForm.watch("foodPercentage") + 
                         financialForm.watch("funPercentage") + 
                         financialForm.watch("savingsPercentage")}%
                      </span>
                    </div>
                    {financialForm.watch("essentialsPercentage") + 
                     financialForm.watch("foodPercentage") + 
                     financialForm.watch("funPercentage") + 
                     financialForm.watch("savingsPercentage") !== 100 && (
                      <p className="text-xs text-red-500">Must equal 100%</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(0)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={
                      financialForm.watch("essentialsPercentage") + 
                      financialForm.watch("foodPercentage") + 
                      financialForm.watch("funPercentage") + 
                      financialForm.watch("savingsPercentage") !== 100
                    }
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}
          
          {/* Step 3: Goals */}
          {currentStep === 2 && (
            <Form {...goalForm}>
              <form onSubmit={goalForm.handleSubmit(handleGoalSubmit)} className="space-y-5">
                <Tabs defaultValue="short">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="short">Short-term Goals</TabsTrigger>
                    <TabsTrigger value="long">Long-term Goals</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="short" className="space-y-5">
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {SUGGESTED_GOALS.filter(g => g.category === "short").map((goal, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            goalForm.setValue("shortTermGoal", goal.title);
                            goalForm.setValue("shortTermAmount", goal.amount);
                          }}
                          className={`p-3 border rounded-lg cursor-pointer hover:border-primary transition-all ${
                            goalForm.watch("shortTermGoal") === goal.title ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {goal.icon}
                            </div>
                            <h4 className="font-medium">{goal.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">{goal.description}</p>
                          <p className="text-sm font-medium mt-1">₹{goal.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    
                    <FormField
                      control={goalForm.control}
                      name="shortTermGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Short-term Goal</FormLabel>
                          <FormControl>
                            <Input placeholder="What are you saving for?" {...field} />
                          </FormControl>
                          <FormDescription>
                            Something you want to achieve in the next 3-6 months
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalForm.control}
                      name="shortTermAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Amount (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="long" className="space-y-5">
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {SUGGESTED_GOALS.filter(g => g.category === "long").map((goal, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            goalForm.setValue("longTermGoal", goal.title);
                            goalForm.setValue("longTermAmount", goal.amount);
                          }}
                          className={`p-3 border rounded-lg cursor-pointer hover:border-primary transition-all ${
                            goalForm.watch("longTermGoal") === goal.title ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <div className="mr-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {goal.icon}
                            </div>
                            <h4 className="font-medium">{goal.title}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">{goal.description}</p>
                          <p className="text-sm font-medium mt-1">₹{goal.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    
                    <FormField
                      control={goalForm.control}
                      name="longTermGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Long-term Goal</FormLabel>
                          <FormControl>
                            <Input placeholder="What's your big financial goal?" {...field} />
                          </FormControl>
                          <FormDescription>
                            Something you're working towards in the next 1-5 years
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalForm.control}
                      name="longTermAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Amount (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit">
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}
          
          {/* Step 4: Connect Apps */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="mb-4">
                <h3 className="font-medium mb-1">Connect Your Apps</h3>
                <p className="text-sm text-muted-foreground">
                  Connect apps to track your spending automatically
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Payment Apps</h4>
                {renderAppOption(
                  "Google Pay", 
                  <CircleDollarSign className="h-5 w-5 text-green-600" />, 
                  "payment app"
                )}
                {renderAppOption(
                  "PhonePe", 
                  <CircleDollarSign className="h-5 w-5 text-purple-600" />, 
                  "payment app"
                )}
                {renderAppOption(
                  "Paytm", 
                  <CircleDollarSign className="h-5 w-5 text-blue-600" />, 
                  "payment app"
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Shopping Apps</h4>
                {renderAppOption(
                  "Amazon", 
                  <ShoppingBag className="h-5 w-5 text-orange-600" />, 
                  "shopping app"
                )}
                {renderAppOption(
                  "Myntra", 
                  <ShoppingBag className="h-5 w-5 text-pink-600" />, 
                  "shopping app"
                )}
                {renderAppOption(
                  "Zomato", 
                  <ShoppingBag className="h-5 w-5 text-red-600" />, 
                  "food delivery app"
                )}
              </div>
              
              <p className="text-xs text-muted-foreground pt-2">
                You can connect more apps later from your profile settings
              </p>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={finishOnboarding}>
                  Finish Setup <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}