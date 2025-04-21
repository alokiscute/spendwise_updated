import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="mb-6 relative">
        <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" fill="hsl(var(--primary))" opacity="0.1"/>
          <circle cx="50" cy="50" r="40" fill="hsl(var(--primary))" opacity="0.2"/>
          <circle cx="50" cy="50" r="30" fill="hsl(var(--primary))"/>
          <path d="M50 35V65M40 45L50 35L60 45M40 55L50 65L60 55" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="absolute bottom-0 right-0 animate-bounce">
          <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="hsl(var(--secondary))"/>
            <path d="M20 16V32M14 22L20 16L26 22M14 26L20 32L26 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-1 text-primary">SaveVibe</h1>
      <p className="text-gray-500 italic mb-8">"Your vibe says shop, your wallet says stop"</p>
      <div className="loader"></div>
    </div>
  );
}
