
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface BotTokenInputProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
  disabled?: boolean;
}

export const BotTokenInput: React.FC<BotTokenInputProps> = ({
  customTokenInput,
  setCustomTokenInput,
  disabled = false
}) => {
  const [showToken, setShowToken] = useState(false);

  const toggleShowToken = () => {
    setShowToken(!showToken);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="bot-token">Bot Token from @BotFather</Label>
      <div className="relative">
        <Input
          id="bot-token"
          type={showToken ? "text" : "password"}
          value={customTokenInput}
          onChange={(e) => setCustomTokenInput(e.target.value)}
          placeholder="Enter your bot token"
          className="w-full pr-10"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
          onClick={toggleShowToken}
          disabled={disabled}
        >
          {showToken ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">
            {showToken ? "Hide token" : "Show token"}
          </span>
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Your bot token is private and sensitive - keep it secure
      </p>
    </div>
  );
};
