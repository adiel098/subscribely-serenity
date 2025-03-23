
import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const BotCreationGuide: React.FC = () => {
  return (
    <div className="space-y-3 mt-6">
      <h4 className="font-medium">How to create a Telegram bot:</h4>
      <ol className="space-y-2 ml-5 list-decimal text-sm text-gray-700">
        <li>Open Telegram and search for @BotFather</li>
        <li>Send /newbot command and follow the instructions</li>
        <li>Copy the API token provided and paste it above</li>
      </ol>
      
      <Button
        variant="outline"
        size="sm"
        className="mt-2 gap-1"
        onClick={() => window.open('https://t.me/BotFather', '_blank')}
      >
        Open BotFather <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default BotCreationGuide;
