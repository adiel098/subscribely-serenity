
import React from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step1AddBotProps {
  useCustomBot?: boolean;
  customBotToken?: string | null;
}

const Step1AddBot: React.FC<Step1AddBotProps> = ({ 
  useCustomBot = false,
  customBotToken = null 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Step 1: Add Bot to Your Group</h3>
      
      {useCustomBot ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Add <strong>your custom bot</strong> as an administrator to your Telegram group or channel.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Important:</p>
                <p className="text-amber-700 mt-1">
                  Make sure your bot has administrator permissions to:
                </p>
                <ul className="list-disc ml-5 mt-1 text-amber-700">
                  <li>Add and remove members</li>
                  <li>Send messages and media</li>
                  <li>Read group messages</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2"
              onClick={() => window.open('https://t.me/BotFather', '_blank')}
            >
              Open BotFather
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Add the <strong>Membify Bot (@MembifyBot)</strong> as an administrator to your Telegram group or channel.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Important:</p>
                <p className="text-amber-700 mt-1">
                  Make sure the bot has administrator permissions to:
                </p>
                <ul className="list-disc ml-5 mt-1 text-amber-700">
                  <li>Add and remove members</li>
                  <li>Send messages</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-2"
              onClick={() => window.open('https://t.me/MembifyBot', '_blank')}
            >
              Open Membify Bot
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1AddBot;
