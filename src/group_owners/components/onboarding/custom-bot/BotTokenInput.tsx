
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BotTokenInputProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
  error?: string | null;
}

export const BotTokenInput: React.FC<BotTokenInputProps> = ({
  customTokenInput,
  setCustomTokenInput,
  error
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const isValidToken = customTokenInput && customTokenInput.length >= 40;

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
          className={`pr-12 ${error ? "border-red-300 focus:ring-red-500" : ""}`}
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
      
      {error && (
        <div className="flex items-start gap-1.5 mt-1">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        This token can be obtained from @BotFather on Telegram
      </p>
      
      {isValidToken && (
        <p className="text-xs text-green-600">
          Token format looks valid ✓
        </p>
      )}
    </div>
  );
};
