import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle, Smartphone, Sparkles, TrendingUp, Target, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function LearnMore() {
  const [, navigate] = useLocation();

  const navigateToAuth = () => {
    navigate("/auth?tab=register");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Money Vibes</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth?tab=login")}
            >
              Log in
            </Button>
            <Button 
              variant="default" 
              className="bg-gradient-to-r from-indigo-500 to-primary hover:opacity-90"
              onClick={navigateToAuth}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How Money Vibes Works</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete guide to how our AI-powered financial assistant helps you save money while still enjoying life
            </p>
          </div>
        </div>
      </section>

      {/* Features Details */}
      <section className="py-12 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Real-time Spending Alerts</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our AI-powered system analyzes your spending patterns in real-time and sends you personalized nudges when you're about to make an impulse purchase.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Smart Detection</h3>
                    <p className="text-muted-foreground">Identifies potential impulse purchases based on your past behavior</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Timely Notifications</h3>
                    <p className="text-muted-foreground">Receive alerts right when you're shopping, not after the fact</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">WhatsApp Integration</h3>
                    <p className="text-muted-foreground">Get alerts through WhatsApp for immediate awareness</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-card border rounded-xl p-8 h-full">
              <div className="flex items-center justify-center h-full">
                <div className="max-w-sm w-full">
                  <div className="border rounded-lg p-4 bg-background mb-4">
                    <div className="flex items-center mb-3">
                      <Smartphone className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-semibold">Spending Alert</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hey! You've spent ₹2,000 on food delivery this week, which is 60% more than your usual. Want to save some for your travel fund?
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">Remind Later</Button>
                      <Button size="sm" className="text-xs bg-primary">Save ₹500</Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-background">
                    <div className="flex items-center mb-3">
                      <Zap className="h-5 w-5 text-amber-500 mr-2" />
                      <h4 className="font-semibold">Shopping Nudge</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      You're about to buy your 3rd pair of sneakers this month! This ₹3,500 could complete your emergency fund goal instead.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs">Proceed anyway</Button>
                      <Button size="sm" className="text-xs bg-primary">Think about it</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Feature */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-card border rounded-xl p-8 h-full">
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="bg-primary/10 w-full max-w-sm rounded-xl p-6 relative">
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full h-10 w-10 flex items-center justify-center text-sm font-medium">+₹100</div>
                  <h3 className="font-bold text-lg mb-2">Weekly Saving Challenge</h3>
                  <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">₹700 of ₹1,000 saved this week</p>
                  <Button size="sm" className="w-full">Save ₹100 more</Button>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center max-w-sm">
                  <div className="border bg-card rounded-lg p-3 text-center w-24">
                    <div className="h-12 w-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="text-xs font-medium">Saver Level 3</p>
                  </div>
                  <div className="border bg-card rounded-lg p-3 text-center w-24">
                    <div className="h-12 w-12 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-2">
                      <Target className="h-6 w-6 text-indigo-500" />
                    </div>
                    <p className="text-xs font-medium">Goal Master</p>
                  </div>
                  <div className="border bg-card rounded-lg p-3 text-center w-24">
                    <div className="h-12 w-12 mx-auto bg-pink-500/10 rounded-full flex items-center justify-center mb-2">
                      <Zap className="h-6 w-6 text-pink-500" />
                    </div>
                    <p className="text-xs font-medium">3-Week Streak</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Gamified Savings That Work</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Make saving fun with challenges, badges, and rewards that turn good financial habits into an engaging experience.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Weekly Challenges</h3>
                    <p className="text-muted-foreground">Fun, achievable goals that build your savings momentum</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Unlockable Badges</h3>
                    <p className="text-muted-foreground">Earn recognition for your financial achievements</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Reward System</h3>
                    <p className="text-muted-foreground">Get special perks and discounts from partner brands</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Third Feature */}
      <section className="py-12 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">AI-Powered Financial Insights</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our TensorFlow-based machine learning models analyze your spending to give you personalized insights and recommendations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Spending Classification</h3>
                    <p className="text-muted-foreground">Automatically categorizes your transactions into wants vs. needs</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Pattern Recognition</h3>
                    <p className="text-muted-foreground">Identifies your unique spending habits and potential areas for improvement</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Predictive Analysis</h3>
                    <p className="text-muted-foreground">Forecasts your future spending based on your behavior</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-card border rounded-xl p-8 h-full">
              <div className="flex items-center justify-center h-full">
                <div className="space-y-4 w-full max-w-sm">
                  <div className="bg-background rounded-lg p-4 border">
                    <h4 className="font-semibold mb-2">This Month's Insight</h4>
                    <p className="text-sm text-muted-foreground">
                      Your food delivery spending is 30% higher on weekends. Setting a weekend budget could save you ₹1,200 monthly.
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border">
                    <h4 className="font-semibold mb-2">Money Wrapped 2025</h4>
                    <p className="text-sm text-muted-foreground">
                      Your spending personality is "Balanced Spender" - you're good at balancing essentials and treats!
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border">
                    <h4 className="font-semibold mb-2">AI Chatbot Suggestion</h4>
                    <p className="text-sm text-muted-foreground">
                      "Try the 24-hour rule: wait one day before making any purchase over ₹2,000 to avoid impulse buys."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about Money Vibes
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does Money Vibes protect my financial data?</AccordionTrigger>
                <AccordionContent>
                  Money Vibes uses end-to-end encryption and follows banking-grade security practices. We never store your bank login credentials, and you can opt out of data tracking at any time. Your privacy and security are our top priorities.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Do I need to connect my bank account?</AccordionTrigger>
                <AccordionContent>
                  Not necessarily! You can manually track your spending or connect to shopping platforms like Amazon and Swiggy to monitor specific spending categories. We use secure APIs like Plaid for any financial connections.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I customize my savings goals?</AccordionTrigger>
                <AccordionContent>
                  Absolutely! You can set any savings goal that matters to you, whether it's a travel fund, emergency savings, or a specific purchase. You can also adjust goal timelines and amounts as your priorities change.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How accurate are the spending alerts?</AccordionTrigger>
                <AccordionContent>
                  Our AI models improve over time as they learn your specific spending habits. The more you use Money Vibes, the more accurate and personalized your alerts will become. You can also provide feedback on alerts to help our system improve.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Is there a fee to use Money Vibes?</AccordionTrigger>
                <AccordionContent>
                  Money Vibes offers a free tier with core features like basic spending tracking and weekly insights. Our premium plan includes advanced features like real-time spending alerts, AI chatbot access, and exclusive badges. You can try all features free for the first month.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Start saving smarter today</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of others who are taking control of their finances with Money Vibes
            </p>
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-primary hover:opacity-90 rounded-full h-12 px-8 text-base font-medium"
              onClick={navigateToAuth}
            >
              Create your free account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}