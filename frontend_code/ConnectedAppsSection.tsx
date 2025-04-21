import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ExternalLink, ShoppingBag, UtensilsCrossed, Music, Film, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Schema for connected app form
const connectAppSchema = z.object({
  appName: z.string().min(2, "App name must be at least 2 characters"),
  appType: z.enum(["shopping", "food", "entertainment", "music", "other"]),
  website: z.string().url("Please enter a valid URL").optional(),
});

type ConnectAppFormData = z.infer<typeof connectAppSchema>;

// Type definitions
interface ConnectedApp {
  id: number;
  userId: number;
  appName: string;
  appType: string;
  connected: boolean | null;
}

interface AppSpending {
  appId: number;
  appName: string;
  appType: string;
  amount: number;
  month: number;
  year: number;
}

// Helper function to get the app icon based on app type
const getAppIcon = (appType: string) => {
  switch (appType) {
    case "shopping":
      return <ShoppingBag className="h-5 w-5" />;
    case "food":
      return <UtensilsCrossed className="h-5 w-5" />;
    case "entertainment":
      return <Film className="h-5 w-5" />;
    case "music":
      return <Music className="h-5 w-5" />;
    default:
      return <ExternalLink className="h-5 w-5" />;
  }
};

// Colors for the pie chart
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

export default function ConnectedAppsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddAppOpen, setIsAddAppOpen] = useState(false);
  
  // Get the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();
  
  // Fetch connected apps
  const { data: connectedApps = [] } = useQuery<ConnectedApp[]>({
    queryKey: ["/api/connected-apps"],
    enabled: !!user,
  });
  
  // Fetch spending data
  const { data: spendingData = [] } = useQuery<AppSpending[]>({
    queryKey: ["/api/connected-apps/spending", currentMonth, currentYear],
    queryFn: async () => {
      try {
        const res = await apiRequest(
          "GET", 
          `/api/connected-apps/spending/${currentMonth}/${currentYear}`
        );
        return await res.json();
      } catch (error) {
        console.error("Error fetching app spending:", error);
        return [];
      }
    },
    enabled: !!user && connectedApps.length > 0,
  });
  
  // Form for adding a new app
  const form = useForm<ConnectAppFormData>({
    resolver: zodResolver(connectAppSchema),
    defaultValues: {
      appName: "",
      appType: "shopping",
      website: "",
    },
  });
  
  // Connect app mutation
  const connectAppMutation = useMutation({
    mutationFn: async (data: ConnectAppFormData) => {
      const res = await apiRequest("POST", "/api/connected-apps/connect", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connected-apps"] });
      setIsAddAppOpen(false);
      form.reset();
      toast({
        title: "App connected",
        description: "The app has been successfully connected to your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to connect app",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Disconnect app mutation
  const disconnectAppMutation = useMutation({
    mutationFn: async (appId: number) => {
      const res = await apiRequest("POST", `/api/connected-apps/${appId}/disconnect`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connected-apps"] });
      toast({
        title: "App disconnected",
        description: "The app has been disconnected from your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to disconnect app",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ConnectAppFormData) => {
    connectAppMutation.mutate(data);
  };
  
  // Prepare data for pie chart
  const chartData = spendingData.map((item, index) => ({
    name: item.appName,
    value: item.amount,
    color: COLORS[index % COLORS.length],
  }));
  
  // Calculate total spending
  const totalSpending = spendingData.reduce((total, item) => total + item.amount, 0);

  // Handle app click (open the website)
  const handleAppClick = (app: ConnectedApp) => {
    // In a real app, we'd get the URL from the database
    // For now, let's make a simple guess based on the app name
    const appNameLower = app.appName.toLowerCase();
    let url = `https://${appNameLower.replace(/\s+/g, '')}.com`;
    
    // Common apps with known URLs
    const knownApps: Record<string, string> = {
      amazon: "https://amazon.com",
      zomato: "https://zomato.com",
      ebay: "https://ebay.com",
      etsy: "https://etsy.com",
      walmart: "https://walmart.com",
      target: "https://target.com",
      ubereats: "https://ubereats.com",
      doordash: "https://doordash.com",
      grubhub: "https://grubhub.com",
      netflix: "https://netflix.com",
      hulu: "https://hulu.com",
      spotify: "https://spotify.com",
      "disney+": "https://disneyplus.com",
    };
    
    if (knownApps[appNameLower]) {
      url = knownApps[appNameLower];
    }
    
    // Open the URL in a new tab
    window.open(url, "_blank");
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Connected Apps</CardTitle>
          <CardDescription>
            View your spending across connected shopping platforms
          </CardDescription>
        </div>
        <Dialog open={isAddAppOpen} onOpenChange={setIsAddAppOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add App
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect a New App</DialogTitle>
              <DialogDescription>
                Add a shopping or entertainment app to track your spending.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="appName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Amazon, Zomato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="appType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select app type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="food">Food Delivery</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={connectAppMutation.isPending}
                  >
                    {connectAppMutation.isPending ? "Connecting..." : "Connect App"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Apps List */}
          <div className="space-y-3 md:w-1/2">
            <h3 className="text-sm font-medium">Your Apps</h3>
            
            {connectedApps.length === 0 ? (
              <div className="text-sm text-muted-foreground border rounded-md p-6 text-center">
                <p>You haven't connected any apps yet.</p>
                <p className="mt-2">Add apps to track your spending across different platforms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {connectedApps.map((app) => (
                  <div 
                    key={app.id}
                    className="flex flex-col items-center border rounded-md p-3 cursor-pointer hover:bg-muted transition-colors relative"
                    onClick={() => handleAppClick(app)}
                  >
                    <button 
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        disconnectAppMutation.mutate(app.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      {getAppIcon(app.appType)}
                    </div>
                    <p className="text-sm font-medium">{app.appName}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {app.appType}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Spending Chart */}
          <div className="md:w-1/2">
            <h3 className="text-sm font-medium mb-3">App Spending Distribution</h3>
            
            {spendingData.length === 0 ? (
              <div className="text-sm text-muted-foreground border rounded-md p-6 text-center h-64 flex items-center justify-center">
                <div>
                  <p>No spending data available.</p>
                  <p className="mt-2">Connect apps and make transactions to see your spending distribution.</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Spent"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalSpending > 0 ? (
            <p>Total spending across apps: <span className="font-medium">${totalSpending.toFixed(2)}</span></p>
          ) : (
            <p>Connect apps to track your spending</p>
          )}
        </div>
        
        <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open("https://amazon.com", "_blank")}>
          <ExternalLink className="h-4 w-4" />
          Shop Now
        </Button>
      </CardFooter>
    </Card>
  );
}