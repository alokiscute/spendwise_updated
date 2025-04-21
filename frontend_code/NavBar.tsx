import { Link, useLocation } from "wouter";
import { MessageSquare, Home, BarChart, Trophy, User, Plus, Sparkles, Target, Bell } from "lucide-react";

export default function NavBar() {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex justify-between">
          <Link href="/dashboard">
            <a className={`flex flex-col items-center py-2 px-1 ${location === "/dashboard" ? "text-primary" : "text-gray-400"}`}>
              <Home className="w-5 h-5" />
              <span className={`text-xs mt-1 ${location === "/dashboard" ? "font-medium" : ""}`}>Home</span>
            </a>
          </Link>
          
          <Link href="/insights">
            <a className={`flex flex-col items-center py-2 px-1 ${location === "/insights" ? "text-primary" : "text-gray-400"}`}>
              <BarChart className="w-5 h-5" />
              <span className={`text-xs mt-1 ${location === "/insights" ? "font-medium" : ""}`}>Insights</span>
            </a>
          </Link>
          
          <div className="relative -mt-5">
            <Link href="/whatsapp">
              <a className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </a>
            </Link>
          </div>
          
          <Link href="/chatbot">
            <a className={`flex flex-col items-center py-2 px-1 ${location === "/chatbot" ? "text-primary" : "text-gray-400"}`}>
              <Sparkles className="w-5 h-5" />
              <span className={`text-xs mt-1 ${location === "/chatbot" ? "font-medium" : ""}`}>AI Chat</span>
            </a>
          </Link>
          
          <Link href="/features">
            <a className={`flex flex-col items-center py-2 px-1 ${location === "/features" ? "text-primary" : "text-gray-400"}`}>
              <Target className="w-5 h-5" />
              <span className={`text-xs mt-1 ${location === "/features" ? "font-medium" : ""}`}>Features</span>
            </a>
          </Link>
          
          <Link href="/profile">
            <a className={`flex flex-col items-center py-2 px-1 ${location === "/profile" ? "text-primary" : "text-gray-400"}`}>
              <User className="w-5 h-5" />
              <span className={`text-xs mt-1 ${location === "/profile" ? "font-medium" : ""}`}>Profile</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
