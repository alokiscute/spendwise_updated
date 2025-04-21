import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import SpendingAlerts from "@/components/SpendingAlerts";
import SavingsChallenges from "@/components/SavingsChallenges";
import { Bell, Target, Brain, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Features() {
  const [activeTab, setActiveTab] = useState("alerts");
  
  // Get ML classification for a default month (current month)
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = now.getFullYear();
  
  const { data: classification, isLoading: classificationLoading } = useQuery({
    queryKey: [`/api/ai/spending-classification/${currentMonth}/${currentYear}`],
  });

  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Features</h1>
        <p className="text-muted-foreground">
          Explore Money Vibes' AI-powered tools to help you save more and spend smarter
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Spending Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Savings Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="ml" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>AI Classification</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts" className="mt-0">
          <SpendingAlerts />
        </TabsContent>
        
        <TabsContent value="challenges" className="mt-0">
          <SavingsChallenges />
        </TabsContent>
        
        <TabsContent value="ml" className="mt-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">AI Spending Classification</h2>
              <p className="text-muted-foreground">
                Our AI models analyze your spending patterns to help you understand your habits
              </p>
            </div>
            
            {classificationLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : classification ? (
              <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">Total Spending</h3>
                        <p className="text-3xl font-bold">₹{classification.totalSpending.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground mt-1">This month</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">Necessities</h3>
                        <p className="text-3xl font-bold">
                          {classification.totalSpending > 0 
                            ? `${Math.round((classification.necessities / classification.totalSpending) * 100)}%` 
                            : '0%'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{classification.necessities.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-2">Wants</h3>
                        <p className="text-3xl font-bold">
                          {classification.totalSpending > 0 
                            ? `${Math.round((classification.wants / classification.totalSpending) * 100)}%` 
                            : '0%'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{classification.wants.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Top Spending Categories</h3>
                  {classification.topCategories.length > 0 ? (
                    <div className="space-y-4">
                      {classification.topCategories.map((category, index) => (
                        <div key={index} className="bg-card p-4 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium capitalize">{category.category}</h4>
                            <span className="font-medium">₹{category.amount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.percentage.toFixed(1)}% of total spending
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No spending data available</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Spending Patterns</h3>
                  {classification.patterns.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {classification.patterns.map((pattern, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium capitalize mb-1">{pattern.category}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {pattern.isNecessity ? 'Necessity' : 'Want'} • {pattern.frequency} spending
                                </p>
                              </div>
                              <span className="font-semibold">₹{pattern.averageAmount.toLocaleString()}</span>
                            </div>
                            
                            {pattern.savingsPotential > 0 && (
                              <div className="bg-primary/10 rounded-lg p-3 text-sm">
                                <div className="flex items-center gap-2 font-medium mb-1">
                                  <Target className="h-4 w-4 text-primary" />
                                  Savings Potential
                                </div>
                                <p>
                                  You could save up to ₹{pattern.savingsPotential.toLocaleString()} by adjusting this spending.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No patterns detected yet</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4">Next Month Predictions</h3>
                  {classification.nextMonthPredictions.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      {classification.nextMonthPredictions.map((prediction, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6 text-center">
                            <h4 className="font-medium capitalize mb-1">{prediction.category}</h4>
                            <p className="text-2xl font-bold">₹{prediction.predictedAmount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {prediction.confidence >= 0.8 ? 'High' : 
                               prediction.confidence >= 0.6 ? 'Medium' : 'Low'} confidence
                              ({Math.round(prediction.confidence * 100)}%)
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not enough data for predictions</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted rounded-lg">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No Classification Data</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Add more transactions to get personalized spending insights
                  powered by our machine learning models.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}