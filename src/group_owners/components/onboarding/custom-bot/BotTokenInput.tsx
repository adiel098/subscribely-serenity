
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BotTokenInputProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
}

export const BotTokenInput: React.FC<BotTokenInputProps> = ({
  customTokenInput,
  setCustomTokenInput
}) => {
  const [showToken, setShowToken] = useState(false);

  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="bot-token">Bot Token from @BotFather</Label>
      <div className="flex gap-2">
        <Input
          id="bot-token"
          type={showToken ? "text" : "password"}
          value={customTokenInput}
          onChange={(e) => setCustomTokenInput(e.target.value)}
          placeholder="Enter your bot token"
          className="flex-1"
        />
        <Button 
          type="button"
          variant="outline" 
          size="icon" 
          onClick={toggleTokenVisibility}
          className="w-10 h-10"
        >
          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        The token will be validated when connecting your Telegram groups
      </p>
    </div>
  );
};
