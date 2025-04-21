import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BadgeCard } from "@/components/ui/badge-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarSelection } from "@/components/ui/avatar-selection";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Profile() {
  const { user, logoutMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nickname: user?.nickname || "",
    avatarType: (user?.avatarType as "funny" | "serious" | "chill") || "funny",
    ageRange: user?.ageRange || "18-24"
  });
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [budgetData, setBudgetData] = useState({
    monthlyBudget: 0,
    essentialsPercentage: 50,
    foodPercentage: 20,
    funPercentage: 20,
    treatsPercentage: 10
  });

  // Fetch user's badges
  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['/api/badges'],
    retry: false,
  });
  
  // Fetch user's budget settings
  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['/api/budget'],
    retry: false,
    onSuccess: (data) => {
      if (data) {
        setBudgetData({
          monthlyBudget: data.monthlyBudget,
          essentialsPercentage: data.essentialsPercentage,
          foodPercentage: data.foodPercentage,
          funPercentage: data.funPercentage,
          treatsPercentage: data.treatsPercentage
        });
      }
    }
  });
  
  // Fetch connected apps
  const { data: connectedApps = [], isLoading: appsLoading } = useQuery({
    queryKey: ['/api/connected-apps'],
    retry: false,
  });
  
  // Mutation for updating budget
  const updateBudgetMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest("PATCH", "/api/budget", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget'] });
      setIsBudgetDialogOpen(false);
      toast({
        title: "Budget Updated",
        description: "Your monthly budget settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update budget: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/auth/me", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };
  
  const handleBudgetSave = () => {
    // Validate that percentages sum to 100%
    const totalPercentage = 
      budgetData.essentialsPercentage +
      budgetData.foodPercentage +
      budgetData.funPercentage +
      budgetData.treatsPercentage;
    
    if (totalPercentage !== 100) {
      toast({
        title: "Invalid Budget Allocation",
        description: "Category percentages must add up to 100%.",
        variant: "destructive",
      });
      return;
    }
    
    updateBudgetMutation.mutate(budgetData);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isLoading = badgesLoading || budgetLoading || appsLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  // Group badges by earned status
  const earnedBadges = badges.filter((badge: any) => badge.earned);
  const lockedBadges = badges.filter((badge: any) => !badge.earned);
  
  return (
    <div className="p-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
        <p className="text-gray-500">Manage your account and settings</p>
      </header>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                <Input 
                  value={profileData.nickname}
                  onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                  placeholder="Your nickname"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Vibe</label>
                <AvatarSelection 
                  selected={profileData.avatarType} 
                  onChange={(value) => setProfileData({ ...profileData, avatarType: value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={profileData.ageRange}
                  onChange={(e) => setProfileData({ ...profileData, ageRange: e.target.value })}
                >
                  <option value="18-24">18-24 years</option>
                  <option value="25-30">25-30 years</option>
                  <option value="31-35">31-35 years</option>
                  <option value="36+">36+ years</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="mr-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <i className={`
                    ${profileData.avatarType === "funny" ? "ri-emotion-laugh-line" : 
                      profileData.avatarType === "serious" ? "ri-emotion-normal-line" : 
                      "ri-emotion-line"} 
                    text-2xl text-primary
                  `}></i>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg">{profileData.nickname}</h3>
                <p className="text-gray-500 text-sm">{user?.username}</p>
                <p className="text-gray-500 text-sm">Age: {profileData.ageRange}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleProfileSave}>Save Changes</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </CardFooter>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Budget Settings</CardTitle>
          <CardDescription>Configure your monthly spending limits</CardDescription>
        </CardHeader>
        <CardContent>
          {budget ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Monthly Budget:</span>
                <span>₹{budget.monthlyBudget.toLocaleString()}</span>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Essentials</span>
                  <span>{budget.essentialsPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${budget.essentialsPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Food</span>
                  <span>{budget.foodPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-warning-500 rounded-full" 
                    style={{ width: `${budget.foodPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fun</span>
                  <span>{budget.funPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-secondary rounded-full" 
                    style={{ width: `${budget.funPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Treats</span>
                  <span>{budget.treatsPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-error-500 rounded-full" 
                    style={{ width: `${budget.treatsPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No budget settings found. Set up your budget to get started.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => setIsBudgetDialogOpen(true)}
          >
            {budget ? "Update Budget" : "Set Budget"}
          </Button>
        </CardFooter>
      </Card>
      
      <Accordion type="single" collapsible className="mb-6">
        <AccordionItem value="badges">
          <AccordionTrigger>
            <div className="flex items-center">
              <i className="ri-trophy-line text-primary mr-2"></i>
              <span>Your Badges ({earnedBadges.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-2">
              <h3 className="text-sm font-medium text-gray-700">Earned Badges</h3>
              <div className="space-y-3">
                {earnedBadges.map((badge: any) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
              
              {lockedBadges.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-gray-700 mt-4">Locked Badges</h3>
                  <div className="space-y-3">
                    {lockedBadges.map((badge: any) => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="connectedApps">
          <AccordionTrigger>
            <div className="flex items-center">
              <i className="ri-link text-primary mr-2"></i>
              <span>Connected Apps</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 mt-2">
              {connectedApps.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-${
                      app.appName === "Google Pay" ? "green" : 
                      app.appName === "PhonePe" ? "purple" : 
                      app.appName === "Paytm" ? "blue" :
                      app.appName === "Amazon" ? "orange" :
                      app.appName === "Myntra" ? "pink" :
                      app.appName === "Zomato" ? "red" : "gray"
                    }-100 flex items-center justify-center mr-3`}>
                      <i className={`ri-${
                        app.appName === "Google Pay" ? "google" : 
                        app.appName === "PhonePe" ? "phone" : 
                        app.appName === "Paytm" ? "wallet-3" :
                        app.appName === "Amazon" ? "shopping-bag" :
                        app.appName === "Myntra" ? "t-shirt" :
                        app.appName === "Zomato" ? "restaurant" : "apps"
                      }-line text-${
                        app.appName === "Google Pay" ? "green" : 
                        app.appName === "PhonePe" ? "purple" : 
                        app.appName === "Paytm" ? "blue" :
                        app.appName === "Amazon" ? "orange" :
                        app.appName === "Myntra" ? "pink" :
                        app.appName === "Zomato" ? "red" : "gray"
                      }-600`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium">{app.appName}</h3>
                      <p className="text-xs text-gray-500 capitalize">{app.appType} app</p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${app.connected ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>
                      {app.connected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Button 
        variant="outline" 
        className="w-full border-red-300 text-red-500 hover:bg-red-50"
        onClick={handleLogout}
      >
        Log Out
      </Button>
      
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (₹)</label>
              <Input 
                type="number"
                value={budgetData.monthlyBudget}
                onChange={(e) => setBudgetData({ ...budgetData, monthlyBudget: Number(e.target.value) })}
                placeholder="e.g., 30000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Essentials (%)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={budgetData.essentialsPercentage}
                onChange={(e) => setBudgetData({ ...budgetData, essentialsPercentage: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food (%)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={budgetData.foodPercentage}
                onChange={(e) => setBudgetData({ ...budgetData, foodPercentage: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fun (%)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={budgetData.funPercentage}
                onChange={(e) => setBudgetData({ ...budgetData, funPercentage: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treats (%)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={budgetData.treatsPercentage}
                onChange={(e) => setBudgetData({ ...budgetData, treatsPercentage: Number(e.target.value) })}
              />
            </div>
            
            <div className="text-sm text-gray-500">
              Total: {budgetData.essentialsPercentage + budgetData.foodPercentage + budgetData.funPercentage + budgetData.treatsPercentage}% 
              {(budgetData.essentialsPercentage + budgetData.foodPercentage + budgetData.funPercentage + budgetData.treatsPercentage) !== 100 && (
                <span className="text-red-500"> (must equal 100%)</span>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBudgetDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleBudgetSave}
              disabled={updateBudgetMutation.isPending}
            >
              {updateBudgetMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
