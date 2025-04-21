import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  nickname?: string;
  avatarType?: string;
  ageRange?: string;
}

interface ProfileUpdateData {
  nickname?: string;
  avatarType?: string;
  ageRange?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: ProfileUpdateData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      // User is not logged in, clear any state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      throw new Error("Login failed. Please check your credentials and try again.");
    }
  };
  
  const register = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", { username, password });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Username already exists")) {
        throw new Error("This email is already registered. Please use a different email or log in.");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }
  };
  
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
    } catch (error) {
      throw new Error("Logout failed. Please try again.");
    }
  };
  
  const updateUserProfile = async (data: ProfileUpdateData) => {
    try {
      // In a real app, we would send this to the server
      // For now, just update the local state since we're using in-memory storage
      setUser(user => user ? { ...user, ...data } : null);
      return Promise.resolve();
    } catch (error) {
      throw new Error("Failed to update profile. Please try again.");
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
