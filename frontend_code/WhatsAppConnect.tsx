import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, Check, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function WhatsAppConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [notifications, setNotifications] = useState({
    expenses: true,
    weeklyReports: true,
    goals: true,
    savingTips: true,
  });

  // Mock for connecting WhatsApp - in production this would call the actual WhatsApp API
  const connectMutation = useMutation({
    mutationFn: async (phone: string) => {
      // This would actually call a backend API endpoint
      // return await apiRequest("POST", "/api/whatsapp/connect", { phoneNumber: phone });
      
      // For demo purposes, we'll simulate a successful connection
      return { success: true, message: "WhatsApp connected successfully" };
    },
    onSuccess: () => {
      setIsConnected(true);
      setShowConnectDialog(false);
      toast({
        title: "WhatsApp Connected!",
        description: "You'll now receive notifications on WhatsApp.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect WhatsApp",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    connectMutation.mutate(phoneNumber);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Connect</h1>
        <p className="text-muted-foreground">
          Receive financial updates and interact with your budget via WhatsApp
        </p>
      </div>

      {/* Connection Status Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Link your WhatsApp to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-100' : 'bg-muted'}`}>
                <MessageSquare className={`h-5 w-5 ${isConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected 
                    ? `Connected: ${phoneNumber}` 
                    : "Not connected"}
                </p>
              </div>
            </div>
            <Button
              variant={isConnected ? "outline" : "default"}
              onClick={() => setShowConnectDialog(true)}
            >
              {isConnected ? "Update" : "Connect"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Choose what updates you want to receive on WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="expenses" className="font-medium">Large Expenses</Label>
              <p className="text-sm text-muted-foreground">Get alerts for unusually large expenses</p>
            </div>
            <Switch 
              id="expenses" 
              checked={notifications.expenses}
              onCheckedChange={() => toggleNotification('expenses')}
              disabled={!isConnected}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReports" className="font-medium">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Receive weekly spending summaries</p>
            </div>
            <Switch 
              id="weeklyReports" 
              checked={notifications.weeklyReports}
              onCheckedChange={() => toggleNotification('weeklyReports')}
              disabled={!isConnected}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="goals" className="font-medium">Goal Progress</Label>
              <p className="text-sm text-muted-foreground">Updates on your saving goals progress</p>
            </div>
            <Switch 
              id="goals" 
              checked={notifications.goals}
              onCheckedChange={() => toggleNotification('goals')}
              disabled={!isConnected}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="savingTips" className="font-medium">Saving Tips</Label>
              <p className="text-sm text-muted-foreground">Receive personalized saving tips</p>
            </div>
            <Switch 
              id="savingTips" 
              checked={notifications.savingTips}
              onCheckedChange={() => toggleNotification('savingTips')}
              disabled={!isConnected}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chat Commands Help */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Chat Commands</CardTitle>
          <CardDescription>
            Interact with your finances directly on WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <p className="font-mono bg-muted p-1 rounded">/balance</p>
            <p className="text-sm">Check your current balance</p>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <p className="font-mono bg-muted p-1 rounded">/goals</p>
            <p className="text-sm">View your saving goals</p>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <p className="font-mono bg-muted p-1 rounded">/spend &lt;amount&gt; &lt;category&gt;</p>
            <p className="text-sm">Log a new expense</p>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <p className="font-mono bg-muted p-1 rounded">/save &lt;amount&gt;</p>
            <p className="text-sm">Add to your savings</p>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <p className="font-mono bg-muted p-1 rounded">/advice</p>
            <p className="text-sm">Get spending advice</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-3">
          <p className="text-sm text-muted-foreground">
            {isConnected ? "Try them out now!" : "Connect WhatsApp to use commands"}
          </p>
          <Button variant="ghost" size="sm" disabled={!isConnected}>
            View All Commands <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Your WhatsApp Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (234) 567-8900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-md flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">How this works:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                    <li>Enter your WhatsApp number</li>
                    <li>You'll receive a message with a verification code</li>
                    <li>Reply with the code to complete setup</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={connectMutation.isPending}>
              {connectMutation.isPending ? "Connecting..." : "Connect WhatsApp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}