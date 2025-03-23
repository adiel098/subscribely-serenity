
import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const OfficialBotInstructions: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-800">To set up the official bot:</h4>
      
      <ol className="space-y-3 ml-5 list-decimal text-gray-700">
        <li className="pl-1">
          <span className="font-medium">Open the Membify Bot on Telegram</span>
          <p className="mt-1 text-sm text-gray-600">
            Click the button below to open the official Membify Bot (@MembifyBot) in Telegram.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => window.open('https://t.me/MembifyBot', '_blank')}
          >
            Open Membify Bot <ExternalLink className="h-3 w-3" />
          </Button>
        </li>
        
        <li className="pl-1">
          <span className="font-medium">Start the bot</span>
          <p className="mt-1 text-sm text-gray-600">
            Send the /start command to the bot to initialize it. The bot will respond with a welcome message.
          </p>
        </li>
        
        <li className="pl-1">
          <span className="font-medium">Add the bot to your group or channel</span>
          <p className="mt-1 text-sm text-gray-600">
            Add @MembifyBot as an administrator to your Telegram group or channel. Make sure to give it permissions to:
          </p>
          <ul className="list-disc ml-5 mt-1 text-sm text-gray-600">
            <li>Add and remove members</li>
            <li>Send messages</li>
            <li>Read group messages</li>
          </ul>
        </li>
      </ol>

      <div className="text-sm text-gray-500 mt-4">
        <p>In the next step, you'll verify and connect your group with our system.</p>
      </div>
    </div>
  );
};
