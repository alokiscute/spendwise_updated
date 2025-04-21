import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, CheckCircle, CreditCard, Smartphone, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToAuth = () => {
    navigate("/auth?tab=register");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "loop" 
              }}
              className="bg-yellow-400 h-8 w-8 rounded-full flex items-center justify-center shadow-md"
            >
              <span className="text-yellow-800 font-bold">₹</span>
            </motion.div>
            <span className="font-bold text-xl">Spend Wise</span>
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
      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
              <span className="text-pink-500 font-medium">✨ New</span>
              <span className="ml-1 text-muted-foreground">Spending Wrapped 2025</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-primary">
              Spend smarter, save more, vibe better
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              The Gen Z financial assistant that helps you control impulse spending with real-time nudges and gamified savings.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-primary hover:opacity-90 rounded-full h-12 px-8 text-base font-medium"
                onClick={navigateToAuth}
              >
                Try for free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="h-12 px-8 text-base font-medium rounded-full"
                onClick={() => navigate("/learn-more")}
              >
                How it works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Spending Nudges</h3>
              <p className="text-muted-foreground">
                Get smart notifications when shopping that help you avoid impulse purchases.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gamified Savings</h3>
              <p className="text-muted-foreground">
                Earn badges and rewards for meeting savings goals and building healthy financial habits.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Budget Automation</h3>
              <p className="text-muted-foreground">
                Automatically set aside money for goals and track your wants vs. needs spending.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">How Spend Wise Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Take control of your finances in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
                <span className="text-2xl">1</span>
                <div className="absolute -right-8 top-1/2 hidden md:block border-t-2 border-dashed border-primary/30 w-16"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Your Spending</h3>
              <p className="text-muted-foreground">
                Link your shopping apps and get real-time insights on your spending habits.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
                <span className="text-2xl">2</span>
                <div className="absolute -right-8 top-1/2 hidden md:block border-t-2 border-dashed border-primary/30 w-16"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Set Personalized Goals</h3>
              <p className="text-muted-foreground">
                Create custom saving goals that match your lifestyle and priorities.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Save & Earn Rewards</h3>
              <p className="text-muted-foreground">
                Receive smart nudges, build habits, and earn badges as you improve your finances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">What Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it
            </p>
          </div>
          
          <Tabs defaultValue="tab1" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">Sarah</TabsTrigger>
              <TabsTrigger value="tab2">Miguel</TabsTrigger>
              <TabsTrigger value="tab3">Zoe</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-6">
              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">👩🏽</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah K.</h4>
                    <p className="text-sm text-muted-foreground">Student, 22</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "Spend Wise helped me stop impulse shopping! The nudges when I'm about to blow my budget are a lifesaver. I've saved ₹30,000 in just 3 months."
                </p>
                <div className="flex mt-4">
                  <span className="text-yellow-500">★★★★★</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tab2" className="mt-6">
              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">👨🏽</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Miguel R.</h4>
                    <p className="text-sm text-muted-foreground">Designer, 25</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "The gamification aspect is genius! Earning badges and seeing my progress keeps me motivated to save more each month. My yearly vibe report was eye-opening."
                </p>
                <div className="flex mt-4">
                  <span className="text-yellow-500">★★★★★</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tab3" className="mt-6">
              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">👩🏼</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Zoe L.</h4>
                    <p className="text-sm text-muted-foreground">Freelancer, 24</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">
                  "Finally an app that doesn't make me feel judged about my spending! Spend Wise helps me balance treating myself while still saving for my goals."
                </p>
                <div className="flex mt-4">
                  <span className="text-yellow-500">★★★★★</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="bg-gradient-to-r from-indigo-500/10 to-primary/10 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to level up your finances?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of Gen Z users who are saving more while still enjoying life.
            </p>
            
            <ul className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 mb-8 max-w-2xl mx-auto">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Free to start</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Personalized for you</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Cancel anytime</span>
              </li>
            </ul>
            
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-primary hover:opacity-90 rounded-full h-12 px-8 text-base font-medium"
              onClick={navigateToAuth}
            >
              Get started for free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  repeatType: "loop" 
                }}
                className="bg-yellow-400 h-8 w-8 rounded-full flex items-center justify-center shadow-md"
              >
                <span className="text-yellow-800 font-bold">₹</span>
              </motion.div>
              <span className="font-bold text-xl">Spend Wise</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <a href="#" className="text-muted-foreground hover:text-foreground">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Features</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Blog</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Support</a>
            </div>
            
            <div className="mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">© 2025 Spend Wise. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}