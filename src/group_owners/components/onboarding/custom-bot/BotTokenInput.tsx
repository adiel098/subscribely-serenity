
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BotTokenInputProps {
  customTokenInput: string;
  setCustomTokenInput: (value: string) => void;
}

export const BotTokenInput: React.FC<BotTokenInputProps> = ({
  customTokenInput,
  setCustomTokenInput
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
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        The token will be validated when connecting your Telegram groups
      </p>
    </div>
  );
};
