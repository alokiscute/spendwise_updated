import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, CheckCircle, Info, Settings, Plus, Edit, Trash } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Alert schema
const alertSchema = z.object({
  category: z.string().min(1, "Category is required"),
  threshold: z.number().min(100, "Threshold must be at least ₹100"),
  timePeriod: z.enum(["daily", "weekly", "monthly"]),
  message: z.string().optional(),
  isActive: z.boolean().default(true)
});

type AlertFormValues = z.infer<typeof alertSchema>;

// Notification component to display spending alerts
export function AlertNotification({ alert, onDismiss }: { 
  alert: { 
    alert: { 
      id: number;
      category: string;
      threshold: number;
      timePeriod: string;
    };
    amountSpent: number;
    message: string;
  };
  onDismiss: () => void;
}) {
  return (
    <Card className="mb-4 border-2 border-orange-400 dark:border-orange-500 animate-pulse">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Spending Alert</CardTitle>
          </div>
          <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
            {alert.alert.category.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>
          {alert.alert.timePeriod.charAt(0).toUpperCase() + alert.alert.timePeriod.slice(1)} alert
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Amount Spent: <span className="text-orange-600 dark:text-orange-400">₹{alert.amountSpent.toLocaleString()}</span></span>
          <span>Threshold: <span className="text-muted-foreground">₹{alert.alert.threshold.toLocaleString()}</span></span>
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex justify-end">
        <Button variant="outline" size="sm" className="mr-2" onClick={onDismiss}>
          Dismiss
        </Button>
        <Button size="sm">View Budget</Button>
      </CardFooter>
    </Card>
  );
}

// Alert form for creating/editing alerts
export function AlertForm({ 
  defaultValues, 
  onSubmit, 
  onCancel 
}: { 
  defaultValues?: Partial<AlertFormValues>;
  onSubmit: (data: AlertFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      category: defaultValues?.category || "",
      threshold: defaultValues?.threshold || 1000,
      timePeriod: defaultValues?.timePeriod || "weekly",
      message: defaultValues?.message || "",
      isActive: defaultValues?.isActive !== undefined ? defaultValues.isActive : true
    },
  });

  const categories = [
    "food", "groceries", "shopping", "entertainment", "transportation", 
    "utilities", "rent", "health", "education", "travel", "subscriptions"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spending Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the spending category you want to monitor
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert Threshold (₹{field.value.toLocaleString()})</FormLabel>
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
                You'll receive an alert when spending exceeds this amount
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="timePeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Period</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The time period to track spending
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Message (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Example: You've spent {amount} on {category} this {period}!" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Use {amount}, {threshold}, {category}, and {period} as placeholders
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Alert Status</FormLabel>
                <FormDescription>
                  Enable or disable this spending alert
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Alert</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Main component for managing spending alerts
export default function SpendingAlerts() {
  const { toast } = useToast();
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [editingAlert, setEditingAlert] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/spending-alerts"],
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  // Check for triggered alerts
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/spending-alerts/check"],
    refetchInterval: 1000 * 60 * 10, // Refresh every 10 minutes
  });

  // Create alert mutation
  const createMutation = useMutation({
    mutationFn: async (data: AlertFormValues) => {
      const res = await apiRequest("POST", "/api/spending-alerts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spending-alerts"] });
      setIsCreatingAlert(false);
      toast({
        title: "Alert Created",
        description: "Your spending alert has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update alert mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AlertFormValues }) => {
      const res = await apiRequest("PATCH", `/api/spending-alerts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spending-alerts"] });
      setEditingAlert(null);
      toast({
        title: "Alert Updated",
        description: "Your spending alert has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete alert mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/spending-alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spending-alerts"] });
      toast({
        title: "Alert Deleted",
        description: "Your spending alert has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (data: AlertFormValues) => {
    if (editingAlert !== null) {
      updateMutation.mutate({ id: editingAlert, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle alert deletion
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter alerts based on active status
  const filteredAlerts = Array.isArray(alerts) 
    ? alerts.filter(alert => 
        activeTab === "active" 
          ? alert.isActive 
          : !alert.isActive)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Spending Alerts</h2>
          <p className="text-muted-foreground">
            Set up personalized alerts to help you stay on budget
          </p>
        </div>
        <Dialog open={isCreatingAlert} onOpenChange={setIsCreatingAlert}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Spending Alert</DialogTitle>
              <DialogDescription>
                Set up an alert to notify you when you exceed your spending threshold.
              </DialogDescription>
            </DialogHeader>
            <AlertForm 
              onSubmit={handleSubmit} 
              onCancel={() => setIsCreatingAlert(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {notifications && notifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Bell className="mr-2 h-5 w-5 text-orange-500" />
            Active Alerts ({notifications.length})
          </h3>
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <AlertNotification 
                key={`notification-${index}`} 
                alert={notification} 
                onDismiss={() => {
                  // In a real app, you would mark the notification as read
                  toast({
                    title: "Alert Dismissed",
                    description: "This alert has been dismissed.",
                  });
                }} 
              />
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="pt-4">
          {alertsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAlerts.map(alert => (
                <Card key={alert.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg capitalize">{alert.category}</CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingAlert(alert.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {alert.timePeriod.charAt(0).toUpperCase() + alert.timePeriod.slice(1)} alert
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Threshold:</span>
                        <span className="font-medium">₹{alert.threshold.toLocaleString()}</span>
                      </div>
                      {alert.message && (
                        <div className="text-sm mt-2 text-muted-foreground">
                          {alert.message}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-1">No active alerts</h3>
              <p className="text-muted-foreground mb-4">
                Create an alert to get notified when you exceed your spending limit.
              </p>
              <Button onClick={() => setIsCreatingAlert(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="inactive" className="pt-4">
          {alertsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAlerts.map(alert => (
                <Card key={alert.id} className="opacity-70">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg capitalize">{alert.category}</CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingAlert(alert.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {alert.timePeriod.charAt(0).toUpperCase() + alert.timePeriod.slice(1)} alert (Inactive)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Threshold:</span>
                        <span className="font-medium">₹{alert.threshold.toLocaleString()}</span>
                      </div>
                      {alert.message && (
                        <div className="text-sm mt-2 text-muted-foreground">
                          {alert.message}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-1">No inactive alerts</h3>
              <p className="text-muted-foreground">
                You don't have any inactive alerts.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Alert Dialog */}
      {editingAlert !== null && alerts && (
        <Dialog 
          open={editingAlert !== null} 
          onOpenChange={(open) => !open && setEditingAlert(null)}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Spending Alert</DialogTitle>
              <DialogDescription>
                Modify your spending alert settings.
              </DialogDescription>
            </DialogHeader>
            <AlertForm 
              defaultValues={alerts.find(a => a.id === editingAlert)} 
              onSubmit={handleSubmit} 
              onCancel={() => setEditingAlert(null)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}