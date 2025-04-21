import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/auth-page";
import LearnMore from "@/pages/LearnMore";
import Features from "@/pages/Features";
import Goals from "@/pages/Goals";
import Insights from "@/pages/Insights";
import Profile from "@/pages/Profile";
import MoneyWrapped from "@/pages/MoneyWrapped";
import WhatsAppConnect from "@/pages/WhatsAppConnect";
import AIChatbot from "@/pages/AIChatbot";
import SplashScreen from "@/components/SplashScreen";
import Onboarding from "@/components/Onboarding";
import ConnectSpending from "@/components/ConnectSpending";
import YearlyVibe from "@/components/YearlyVibe";
import NavBar from "@/components/NavBar";
import SpendingNudge from "@/components/SpendingNudge";
import IncomeSetup from "@/components/IncomeSetup";
import GoalsSetup from "@/components/GoalsSetup";
import { useState, useEffect } from "react";
import { SpendingProvider } from "@/contexts/SpendingContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login">
        {() => <Redirect to="/auth?tab=login" />}
      </Route>
      <Route path="/learn-more" component={LearnMore} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        {() => <Dashboard />}
      </Route>
      <Route path="/goals">
        {() => <Goals />}
      </Route>
      <Route path="/features">
        {() => <Features />}
      </Route>
      <Route path="/insights">
        {() => <Insights />}
      </Route>
      <Route path="/profile">
        {() => <Profile />}
      </Route>
      <Route path="/money-wrapped">
        {() => <MoneyWrapped />}
      </Route>
      <Route path="/whatsapp">
        {() => <WhatsAppConnect />}
      </Route>
      <Route path="/chatbot">
        {() => <AIChatbot />}
      </Route>
      <Route path="/income-setup">
        {() => <IncomeSetup />}
      </Route>
      <Route path="/goals-setup">
        {() => <GoalsSetup />}
      </Route>
      <Route path="/connect-spending">
        {() => <ConnectSpending />}
      </Route>
      <Route path="/yearly-vibe">
        {() => <YearlyVibe />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showNavBar, setShowNavBar] = useState(false);
  const [location] = useLocation();
  
  // Define special routes outside of the effect
  const specialRoutes = [
    "/",
    "/auth", 
    "/login",
    "/learn-more",
    "/onboarding",
    "/income-setup",
    "/goals-setup", 
    "/connect-spending", 
    "/yearly-vibe", 
    "/money-wrapped"
  ];
  
  // Show loading screen briefly for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Control navbar visibility based on route
  useEffect(() => {
    setShowNavBar(!specialRoutes.includes(location));
  }, [location, specialRoutes]);
  
  // If still loading auth status, show splash screen
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <div className={`${!specialRoutes.includes(location) ? 'max-w-md mx-auto' : ''} min-h-screen bg-background relative overflow-hidden`}>
      {/* Decorative background elements (only for app pages, not landing) */}
      {!specialRoutes.includes(location) && (
        <>
          <div className="fixed top-0 right-0 w-72 h-72 bg-primary/5 rounded-full -translate-y-24 translate-x-16 blur-3xl"></div>
          <div className="fixed bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full translate-y-24 -translate-x-16 blur-3xl"></div>
          <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        </>
      )}
      
      <div className="relative z-10">
        <Router />
        {showNavBar && <NavBar />}
        {!specialRoutes.includes(location) && <SpendingNudge />}
        <Toaster />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SpendingProvider>
          <AppContent />
        </SpendingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
