
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BotTokenInputProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
}

export const BotTokenInput: React.FC<BotTokenInputProps> = ({
  customTokenInput,
  setCustomTokenInput,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="bot-token" className="text-gray-700 font-medium">
        Bot Token
        <span className="text-red-500"> *</span>
      </Label>
      
      <div className="relative">
        <Input
          id="bot-token"
          type={isVisible ? "text" : "password"}
          value={customTokenInput}
          onChange={(e) => setCustomTokenInput(e.target.value)}
          placeholder="Paste your bot token from @BotFather"
          className="pr-12"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleVisibility}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>
      
      <p className="text-xs text-gray-500">
        This token can be obtained from @BotFather on Telegram
      </p>
    </div>
  );
};
