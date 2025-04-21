import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, User, Key, Mail, SmilePlus, UserCircle, CalendarRange } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
  nickname: z.string().min(2, "Nickname must be at least 2 characters").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  avatarType: z.enum(["funny", "serious", "chill"]).optional(),
  ageRange: z.enum(["18-24", "25-30", "31-35", "36+"]).optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  
  // Parse the tab from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Initialize forms regardless of loading state
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      nickname: "",
      fullName: "",
      avatarType: "funny",
      ageRange: "18-24"
    },
  });
  
  // Hook for handling the redirect when user is logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);
  
  // Wait for auth to load before rendering the forms
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-bold">Loading...</h2>
        <p className="text-muted-foreground">Getting things ready</p>
      </div>
    </div>;
  }
  
  // If user is already logged in, show loading while redirect happens
  if (user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-bold">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to your dashboard</p>
      </div>
    </div>;
  }

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/onboarding");
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Column: Form */}
      <div className="flex flex-col justify-center px-4 py-10 w-full md:w-1/2">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-yellow-400 h-8 w-8 rounded-full flex items-center justify-center shadow-md">
                <span className="text-yellow-800 font-bold">₹</span>
              </div>
              <h1 className="text-3xl font-bold gradient-text">Spend Wise</h1>
            </div>
            <p className="text-muted-foreground">Take control of your finances with smart insights</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardContent className="pt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Enter your username"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full bubble button-glow mt-6 bg-gradient-to-r from-indigo-500 to-primary"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          "Logging in..."
                        ) : (
                          <span className="flex items-center">
                            Login <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardContent className="pt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Choose a username"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nickname (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="How should we call you?"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Your full name"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="ageRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age Range (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <select
                                  className="w-full h-10 pl-10 pr-3 py-2 text-sm rounded-md border border-input bg-background"
                                  {...field}
                                >
                                  <option value="18-24">18-24 years</option>
                                  <option value="25-30">25-30 years</option>
                                  <option value="31-35">31-35 years</option>
                                  <option value="36+">36+ years</option>
                                </select>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full bubble button-glow mt-6 bg-gradient-to-r from-indigo-500 to-primary"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          "Creating Account..."
                        ) : (
                          <span className="flex items-center">
                            Create Account <SmilePlus className="ml-2 h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column: Hero */}
      <div className="hidden md:flex md:w-1/2 bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/20"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12 z-10">
          <div className="max-w-md text-center space-y-6">
            <h2 className="text-4xl font-bold text-foreground">
              Save more, spend wisely, live better
            </h2>
            <p className="text-xl text-muted-foreground">
              Spend Wise helps you track spending, set goals, and build better financial habits with real-time nudges and rewards.
            </p>
            <ul className="space-y-4 text-left">
              <li className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-xl">💸</span>
                </div>
                <span>Get real-time spending alerts when shopping</span>
              </li>
              <li className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-xl">🎯</span>
                </div>
                <span>Set and track personalized saving goals</span>
              </li>
              <li className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-xl">🏆</span>
                </div>
                <span>Earn badges and rewards for good financial habits</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-secondary/10 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
      </div>
    </div>
  );
}