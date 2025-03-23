
import React from "react";
import { Bot, Shield, Star, Sparkles } from "lucide-react";
import { BotCard } from "./BotCard";

interface BotSelectionCardsProps {
  selected: "official" | "custom" | null;
  setSelected: (value: "official" | "custom") => void;
}

export const BotSelectionCards: React.FC<BotSelectionCardsProps> = ({ 
  selected, 
  setSelected 
}) => {
  const officialBotBenefits = [
    "Fully managed by Membify - zero setup",
    "Works for multiple groups without additional configuration",
    "Automatic updates and maintenance",
    "Recommended for most users"
  ];

  const customBotBenefits = [
    "Full brand customization and personalization",
    "Your own bot username and avatar",
    "Private message handling",
    "Ideal for businesses with custom branding needs"
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Official Bot Card */}
      <BotCard 
        title="Membify Official Bot"
        description="Use Membify's official bot with your communities"
        icon={<Bot className="h-6 w-6 text-blue-600" />}
        benefits={officialBotBenefits}
        footerIcon={<Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />}
        footerText="Shared bot used by multiple Membify communities"
        isSelected={selected === "official"}
        onClick={() => setSelected("official")}
        iconBackground="bg-blue-100"
        footerBackground="bg-blue-50 text-blue-700"
      />

      {/* Custom Bot Card */}
      <BotCard
        title="Your Custom Bot"
        description="Use your own Telegram bot with your communities"
        icon={<Shield className="h-6 w-6 text-purple-600" />}
        benefits={customBotBenefits}
        footerIcon={<Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />}
        footerText="Requires creating your own bot with @BotFather"
        isSelected={selected === "custom"}
        onClick={() => setSelected("custom")}
        iconBackground="bg-purple-100"
        footerBackground="bg-purple-50 text-purple-700"
      />
    </div>
  );
};
