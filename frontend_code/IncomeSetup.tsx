import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, PiggyBank, DollarSign, Building, CreditCard, PartyPopper } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const incomeSchema = z.object({
  monthlyIncome: z.coerce.number().min(1, "Income must be at least 1"),
  essentialsPerc: z.number().min(0).max(100),
  savingsPerc: z.number().min(0).max(100),
  wantsPerc: z.number().min(0).max(100),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

export default function IncomeSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [animation, setAnimation] = useState(false);

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      monthlyIncome: 25000,
      essentialsPerc: 50,
      savingsPerc: 30,
      wantsPerc: 20,
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async (data: IncomeFormData) => {
      const budgetData = {
        monthlyBudget: data.monthlyIncome,
        essentialsPerc: data.essentialsPerc,
        savingsPerc: data.savingsPerc,
        wantsPerc: data.wantsPerc,
      };
      return await apiRequest("POST", "/api/budget", budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      setAnimation(true);
      setTimeout(() => {
        navigate("/goals-setup");
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Oof! Something went wrong",
        description: "Couldn't save your income details. Please try again!",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: IncomeFormData) {
    updateBudgetMutation.mutate(data);
  }

  // Ensure percentages add up to 100%
  const handleEssentialsChange = (value: number) => {
    const currentSavings = form.getValues("savingsPerc");
    const currentWants = form.getValues("wantsPerc");
    
    if (value + currentSavings + currentWants > 100) {
      // Adjust other values proportionally
      const overflow = value + currentSavings + currentWants - 100;
      const total = currentSavings + currentWants;
      
      if (total > 0) {
        const newSavings = Math.max(0, currentSavings - (overflow * (currentSavings / total)));
        const newWants = Math.max(0, currentWants - (overflow * (currentWants / total)));
        
        form.setValue("savingsPerc", Math.round(newSavings));
        form.setValue("wantsPerc", Math.round(newWants));
      } else {
        form.setValue("savingsPerc", 0);
        form.setValue("wantsPerc", 0);
      }
    }
    
    form.setValue("essentialsPerc", value);
  };

  const handleSavingsChange = (value: number) => {
    const currentEssentials = form.getValues("essentialsPerc");
    const currentWants = form.getValues("wantsPerc");
    
    if (currentEssentials + value + currentWants > 100) {
      // Adjust wants
      form.setValue("wantsPerc", Math.max(0, 100 - currentEssentials - value));
    }
    
    form.setValue("savingsPerc", value);
  };

  const handleWantsChange = (value: number) => {
    const currentEssentials = form.getValues("essentialsPerc");
    const currentSavings = form.getValues("savingsPerc");
    
    if (currentEssentials + currentSavings + value > 100) {
      // Adjust savings
      form.setValue("savingsPerc", Math.max(0, 100 - currentEssentials - value));
    }
    
    form.setValue("wantsPerc", value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden py-8 px-4">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-24 translate-x-16 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full translate-y-24 -translate-x-16 blur-3xl"></div>
      
      {animation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-300">
            <PartyPopper className="h-16 w-16 text-primary mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold gradient-text">Amazing!</h3>
            <p className="text-muted-foreground">Now let's set up your goals!</p>
          </div>
        </div>
      )}
      
      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Money Vibes</h1>
          <p className="text-muted-foreground">Let's personalize your money flow!</p>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-lg card-hover">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="monthlyIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-primary" />
                      Monthly Income
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          className="pl-8 h-12 rounded-xl text-lg"
                          type="number"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Spending Breakdown</h3>
                <p className="text-sm text-muted-foreground">
                  Drag the sliders to set how you want to split your income
                </p>
                
                <FormField
                  control={form.control}
                  name="essentialsPerc"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-blue-500" />
                          Essentials
                        </FormLabel>
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {value}%
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          {...field}
                          value={[value]}
                          onValueChange={([v]) => handleEssentialsChange(v)}
                          max={100}
                          step={1}
                          className="[&>span]:bg-blue-500"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Rent, food, utilities, transportation
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="savingsPerc"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel className="flex items-center">
                          <PiggyBank className="h-4 w-4 mr-2 text-green-500" />
                          Savings
                        </FormLabel>
                        <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {value}%
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          {...field}
                          value={[value]}
                          onValueChange={([v]) => handleSavingsChange(v)}
                          max={100}
                          step={1}
                          className="[&>span]:bg-green-500"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Emergency fund, investments, future goals
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wantsPerc"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-purple-500" />
                          Wants/Fun
                        </FormLabel>
                        <span className="text-sm font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {value}%
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          {...field}
                          value={[value]}
                          onValueChange={([v]) => handleWantsChange(v)}
                          max={100}
                          step={1}
                          className="[&>span]:bg-purple-500"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Entertainment, eating out, shopping, travel
                      </p>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl font-semibold bubble button-glow flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-primary"
                  disabled={updateBudgetMutation.isPending}
                >
                  {updateBudgetMutation.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      Continue <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}