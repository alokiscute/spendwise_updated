import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, TrendingDown, PiggyBank, Lightbulb, ArrowRight, Loader2, Send } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface Insight {
  type: "saving_opportunity" | "spending_pattern" | "behavior_change" | "goal_recommendation";
  title: string;
  description: string;
  savingPotential?: number;
  confidenceScore: number;
}

interface MonthlyTrend {
  description: string;
  changePercentage?: number;
  isPositive?: boolean;
}

interface NextMonthPrediction {
  description: string;
  predictedAmount?: number;
}

interface MLInsightsResponse {
  summary: string;
  insights: Insight[];
  monthlyTrend: MonthlyTrend;
  nextMonthPrediction: NextMonthPrediction;
  savingTips: string[];
}

export default function MLInsights() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // AI chat state
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  
  // Fetch ML insights
  const { 
    data: insightsData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery<MLInsightsResponse>({
    queryKey: [`/api/ai/insights/month/${selectedMonth}/year/${selectedYear}`],
  });
  
  // Fetch insights when component mounts
  useEffect(() => {
    refetch();
  }, [refetch, selectedMonth, selectedYear]);
  
  // Function to generate an appropriate icon for the insight type
  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "saving_opportunity":
        return <PiggyBank className="h-5 w-5 text-green-500" />;
      case "spending_pattern":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "behavior_change":
        return <TrendingDown className="h-5 w-5 text-amber-500" />;
      case "goal_recommendation":
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };
  
  const generateInsightRequestHandler = () => {
    refetch();
  };
  
  const handleTryAI = () => {
    setShowAiDialog(true);
  };
  
  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsAiLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai/advice", { question: aiQuestion });
      const data = await response.json();
      setAiResponse(data.advice);
    } catch (error) {
      console.error('Error getting AI advice:', error);
      setAiResponse("Sorry, I couldn't process your question right now. Please try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            AI is analyzing your spending patterns and generating personalized insights...
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="mb-3 text-destructive font-medium">Unable to generate insights at this time</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Please ensure you have sufficient transaction data and try again."}
            </p>
            <Button onClick={generateInsightRequestHandler}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If data hasn't been fetched yet
  if (!insightsData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="mb-4 font-medium">Generate AI Insights</p>
            <p className="text-sm text-muted-foreground mb-4">
              Use machine learning to analyze your spending patterns and receive personalized financial advice.
            </p>
            <Button onClick={generateInsightRequestHandler}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      {/* AI Advice Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Ask AI About Your Finances
            </DialogTitle>
            <DialogDescription>
              Get personalized financial advice based on your spending patterns and goals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 border rounded-md bg-secondary/20 min-h-[150px] mb-4">
            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center h-[150px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-center text-muted-foreground">
                  Analyzing your finances and generating a response...
                </p>
              </div>
            ) : aiResponse ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Your question:</p>
                <p className="text-sm">{aiQuestion}</p>
                <div className="h-px bg-border my-3" />
                <p className="text-sm font-semibold">AI response:</p>
                <p className="text-sm whitespace-pre-line">{aiResponse}</p>
              </div>
            ) : (
              <p className="text-sm text-center text-muted-foreground py-12">
                Ask any question about your finances, budget, or goals.
                <br />
                For example: "How can I save more money?" or "Should I cut back on dining out?"
              </p>
            )}
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleAskAI(); }}>
            <div className="flex gap-2">
              <Input
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask about your finances..."
                disabled={isAiLoading}
              />
              <Button type="submit" size="sm" disabled={isAiLoading || !aiQuestion.trim()}>
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="secondary" 
              onClick={() => { 
                setAiQuestion(""); 
                setAiResponse(""); 
                setShowAiDialog(false);
              }}
            >
              Close
            </Button>
            
            {aiResponse && (
              <Button 
                variant="outline" 
                onClick={() => { 
                  setAiQuestion(""); 
                  setAiResponse("");
                }}
              >
                Ask Another Question
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ML Insights Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                ML-Powered Financial Insights
                <Badge variant="outline" className="ml-2 bg-primary/10">
                  AI
                </Badge>
              </CardTitle>
              <CardDescription>
                Personalized analysis of your spending patterns
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleTryAI}>
              Ask AI
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-6">
            <p className="text-lg font-medium mb-2">{insightsData.summary}</p>
          </div>
          
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
              <TabsTrigger value="trends">Trends & Predictions</TabsTrigger>
              <TabsTrigger value="tips">Saving Tips</TabsTrigger>
            </TabsList>
            
            <TabsContent value="insights" className="space-y-4">
              {insightsData.insights.map((insight, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getInsightIcon(insight.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold">{insight.title}</h4>
                          {insight.savingPotential && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Save ${insight.savingPotential.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                        
                        <div className="mt-3">
                          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                            <span>Confidence</span>
                            <span>{Math.round(insight.confidenceScore * 100)}%</span>
                          </div>
                          <Progress value={insight.confidenceScore * 100} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="trends">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Monthly Trend</h4>
                    <div className="flex items-center gap-2 mb-2">
                      {insightsData.monthlyTrend.isPositive !== undefined && (
                        insightsData.monthlyTrend.isPositive ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-amber-500" />
                        )
                      )}
                      {insightsData.monthlyTrend.changePercentage !== undefined && (
                        <Badge variant={insightsData.monthlyTrend.isPositive ? "outline" : "secondary"} className={`${insightsData.monthlyTrend.isPositive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                          {insightsData.monthlyTrend.changePercentage > 0 ? "+" : ""}
                          {insightsData.monthlyTrend.changePercentage.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insightsData.monthlyTrend.description}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Next Month Prediction</h4>
                    {insightsData.nextMonthPrediction.predictedAmount !== undefined && (
                      <div className="mb-2">
                        <span className="text-lg font-bold">
                          ${insightsData.nextMonthPrediction.predictedAmount.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground"> predicted spending</span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {insightsData.nextMonthPrediction.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="tips">
              <div className="space-y-3">
                {insightsData.savingTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 border-b last:border-0">
                    <div className="p-1 bg-primary/10 rounded-full">
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm flex-1">{tip}</p>
                  </div>
                ))}
                
                <Button variant="link" className="mt-2 gap-1" onClick={handleTryAI}>
                  Get more personalized tips
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}