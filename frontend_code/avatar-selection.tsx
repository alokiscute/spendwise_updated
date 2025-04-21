import { useState } from "react";
import { Smile, UserRound, Zap } from "lucide-react";

type AvatarType = "funny" | "serious" | "chill";

interface AvatarSelectionProps {
  selected: AvatarType;
  onChange: (type: AvatarType) => void;
}

export function AvatarSelection({ selected, onChange }: AvatarSelectionProps) {
  const options: { value: AvatarType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      value: "funny",
      label: "Funny",
      icon: <Smile className="h-6 w-6" />,
      color: "bg-yellow-100 text-yellow-600 border-yellow-200",
    },
    {
      value: "serious",
      label: "Serious",
      icon: <UserRound className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-600 border-blue-200",
    },
    {
      value: "chill",
      label: "Chill",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-600 border-purple-200",
    },
  ];

  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex flex-col items-center justify-center border-2 rounded-lg p-3 transition-all ${
            selected === option.value
              ? `${option.color} border-2`
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
          style={{ flex: "1 0 auto" }}
        >
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${
              selected === option.value ? option.color : "bg-gray-100"
            }`}
          >
            {option.icon}
          </div>
          <span className="text-sm font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
}