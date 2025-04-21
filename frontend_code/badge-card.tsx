import { type Badge } from "@shared/schema";

interface BadgeCardProps {
  badge: Badge;
  variant?: "default" | "compact";
}

export function BadgeCard({ badge, variant = "default" }: BadgeCardProps) {
  if (variant === "compact") {
    return (
      <div className="flex flex-col items-center">
        <div className={`w-14 h-14 rounded-full ${badge.earned ? 
          badge.icon.includes("money") ? "bg-green-100" : 
          badge.icon.includes("restaurant") ? "bg-orange-100" : 
          "bg-purple-100" 
          : "bg-gray-100"} flex items-center justify-center mb-2 relative`}>
          <i className={`${badge.icon} text-2xl ${badge.earned ? 
            badge.icon.includes("money") ? "text-green-600" : 
            badge.icon.includes("restaurant") ? "text-orange-600" : 
            "text-purple-600" 
            : "text-gray-400"}`}></i>
          
          {!badge.earned && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gray-200/50 rounded-full flex items-center justify-center">
                <i className="ri-lock-line text-gray-500"></i>
              </div>
            </div>
          )}
        </div>
        <span className={`text-xs font-medium text-center ${badge.earned ? "" : "text-gray-400"}`}>{badge.name}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className={`w-16 h-16 rounded-full ${badge.earned ? 
        badge.icon.includes("money") ? "bg-green-100" : 
        badge.icon.includes("restaurant") ? "bg-orange-100" : 
        "bg-purple-100" 
        : "bg-gray-100"} flex items-center justify-center flex-shrink-0 relative`}>
        <i className={`${badge.icon} text-3xl ${badge.earned ? 
          badge.icon.includes("money") ? "text-green-600" : 
          badge.icon.includes("restaurant") ? "text-orange-600" : 
          "text-purple-600" 
          : "text-gray-400"}`}></i>
        
        {!badge.earned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-gray-200/50 rounded-full flex items-center justify-center">
              <i className="ri-lock-line text-2xl text-gray-500"></i>
            </div>
          </div>
        )}
      </div>
      <div>
        <h3 className={`font-medium ${badge.earned ? "" : "text-gray-400"}`}>{badge.name}</h3>
        <p className="text-sm text-gray-500">{badge.description}</p>
        {badge.earned && badge.earnedDate && (
          <span className="text-xs text-primary">
            Earned on {new Date(badge.earnedDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
