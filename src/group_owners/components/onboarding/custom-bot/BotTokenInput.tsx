
import React from "react";
import { Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface BotTokenInputProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
  validateBotToken: () => void;
  isValidating: boolean;
  validationSuccess: boolean | null;
}

export const BotTokenInput: React.FC<BotTokenInputProps> = ({
  customTokenInput,
  setCustomTokenInput,
  validateBotToken,
  isValidating,
  validationSuccess
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="bot-token">Bot Token from @BotFather</Label>
      <div className="flex gap-2">
        <Input
          id="bot-token"
          type="password"
          value={customTokenInput}
          onChange={(e) => setCustomTokenInput(e.target.value)}
          placeholder="Enter your bot token"
          className="flex-1"
        />
        <Button 
          onClick={validateBotToken} 
          disabled={isValidating || !customTokenInput}
        >
          {isValidating ? "Validating..." : "Validate & Save"}
        </Button>
      </div>
      
      {validationSuccess === true && (
        <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
          <Check className="h-4 w-4" />
          <span>Bot token validated successfully!</span>
        </div>
      )}
      
      {validationSuccess === false && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <AlertCircle className="h-4 w-4" />
          <span>Invalid bot token. Please check and try again.</span>
        </div>
      )}
    </div>
  );
};
