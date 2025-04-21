import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

type AppType = {
  id?: number;
  name: string;
  type: "payment" | "shopping" | "food";
  connected: boolean;
};

export default function ConnectSpending() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sample apps for each category
  const [paymentApps, setPaymentApps] = useState<AppType[]>([
    { name: "Google Pay", type: "payment", connected: true },
    { name: "PhonePe", type: "payment", connected: false },
    { name: "Paytm", type: "payment", connected: false },
  ]);
  
  const [shoppingApps, setShoppingApps] = useState<AppType[]>([
    { name: "Amazon", type: "shopping", connected: true },
    { name: "Myntra", type: "shopping", connected: true },
    { name: "Zomato", type: "food", connected: false },
    { name: "More", type: "shopping", connected: false },
  ]);
  
  const toggleAppConnection = (appName: string, type: "payment" | "shopping" | "food") => {
    if (type === "payment") {
      setPaymentApps(paymentApps.map(app => 
        app.name === appName ? { ...app, connected: !app.connected } : app
      ));
    } else {
      setShoppingApps(shoppingApps.map(app => 
        app.name === appName ? { ...app, connected: !app.connected } : app
      ));
    }
  };
  
  const handleContinue = async () => {
    if (!privacyAgreed) {
      toast({
        title: "Privacy Agreement Required",
        description: "Please agree to the privacy policy to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine all apps
      const allApps = [...paymentApps, ...shoppingApps];
      
      // Save connected apps to the server
      for (const app of allApps) {
        if (!app.id) { // Only create new ones
          await apiRequest("POST", "/api/connected-apps", {
            appName: app.name,
            appType: app.type,
            connected: app.connected,
          });
        }
      }
      
      toast({
        title: "Connected Successfully",
        description: "Your spending accounts have been connected.",
      });
      
      navigate("/yearly-vibe");
    } catch (error) {
      console.error("Error connecting apps:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect your accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-white z-40">
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Connect Your Accounts</h1>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">2/3</span>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full">
              <div className="w-2/3 h-full bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <p className="text-gray-600 mb-6">Let's connect your spending accounts so SaveVibe can help you track your expenses.</p>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-3">Payment Apps</h2>
            <div className="grid grid-cols-3 gap-3">
              {paymentApps.map((app, index) => (
                <div 
                  key={index}
                  className={`border ${app.connected ? 'border-2 border-primary' : ''} rounded-lg p-3 flex flex-col items-center cursor-pointer`}
                  onClick={() => toggleAppConnection(app.name, app.type)}
                >
                  <div className={`w-12 h-12 rounded-full bg-${app.name === "Google Pay" ? "green" : app.name === "PhonePe" ? "purple" : "blue"}-100 flex items-center justify-center mb-2`}>
                    <i className={`ri-${app.name === "Google Pay" ? "google" : app.name === "PhonePe" ? "phone" : "wallet-3"}-line text-xl text-${app.name === "Google Pay" ? "green" : app.name === "PhonePe" ? "purple" : "blue"}-600`}></i>
                  </div>
                  <span className="text-xs font-medium">{app.name}</span>
                  <span className={`text-xs ${app.connected ? 'text-primary' : 'text-gray-400'}`}>{app.connected ? 'Connected' : 'Connect'}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-3">Shopping Apps</h2>
            <div className="grid grid-cols-4 gap-3">
              {shoppingApps.map((app, index) => (
                <div 
                  key={index}
                  className={`border ${app.connected ? 'border-2 border-primary' : ''} rounded-lg p-3 flex flex-col items-center cursor-pointer`}
                  onClick={() => toggleAppConnection(app.name, app.type)}
                >
                  <div className={`w-10 h-10 rounded-full bg-${
                    app.name === "Amazon" ? "orange" : 
                    app.name === "Myntra" ? "pink" : 
                    app.name === "Zomato" ? "red" : "gray"
                  }-100 flex items-center justify-center mb-2`}>
                    <i className={`ri-${
                      app.name === "Amazon" ? "shopping-bag" : 
                      app.name === "Myntra" ? "t-shirt" : 
                      app.name === "Zomato" ? "restaurant" : "add"
                    }-line text-lg text-${
                      app.name === "Amazon" ? "orange" : 
                      app.name === "Myntra" ? "pink" : 
                      app.name === "Zomato" ? "red" : "gray"
                    }-600`}></i>
                  </div>
                  <span className="text-xs font-medium">{app.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <div className="flex items-start mb-3">
              <div className="mt-0.5 mr-3">
                <i className="ri-information-line text-primary"></i>
              </div>
              <div>
                <h3 className="font-medium text-sm">Privacy Notice</h3>
                <p className="text-xs text-gray-600">SaveVibe uses end-to-end encryption and won't share your data with third parties. You can opt out anytime.</p>
              </div>
            </div>
            <div className="flex items-center">
              <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                <Checkbox
                  checked={privacyAgreed}
                  onCheckedChange={(checked) => setPrivacyAgreed(checked as boolean)}
                  className="h-4 w-4 mr-2 text-primary focus:ring-primary"
                />
                I agree to the privacy policy
              </label>
            </div>
          </div>
        </div>
        
        <Button 
          className="bg-primary text-white font-medium p-4 rounded-lg w-full mb-4"
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Connecting..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
