import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface SpendingContextType {
  showNudge: boolean;
  setShowNudge: (show: boolean) => void;
  currentMerchant: string;
  setCurrentMerchant: (merchant: string) => void;
  triggerRandomNudge: () => void;
}

const SpendingContext = createContext<SpendingContextType | undefined>(undefined);

export function SpendingProvider({ children }: { children: ReactNode }) {
  const [showNudge, setShowNudge] = useState(false);
  const [currentMerchant, setCurrentMerchant] = useState("Zomato");
  
  // List of possible merchants for random nudges
  const merchants = ["Zomato", "Amazon", "Myntra", "Swiggy", "Flipkart"];
  
  // Function to trigger a random spending nudge
  const triggerRandomNudge = () => {
    const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
    setCurrentMerchant(randomMerchant);
    setShowNudge(true);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      setShowNudge(false);
    }, 10000);
  };
  
  // Simulate occasional random nudges (only in production this would be based on real behavior)
  useEffect(() => {
    // Set up random nudges with a probability that increases over time
    const nudgeInterval = setInterval(() => {
      // 5% chance of showing a nudge every 2 minutes
      if (Math.random() < 0.05) {
        triggerRandomNudge();
      }
    }, 2 * 60 * 1000); // Check every 2 minutes
    
    return () => clearInterval(nudgeInterval);
  }, []);
  
  return (
    <SpendingContext.Provider
      value={{
        showNudge,
        setShowNudge,
        currentMerchant,
        setCurrentMerchant,
        triggerRandomNudge,
      }}
    >
      {children}
    </SpendingContext.Provider>
  );
}

export function useSpending() {
  const context = useContext(SpendingContext);
  if (context === undefined) {
    throw new Error("useSpending must be used within a SpendingProvider");
  }
  return context;
}
