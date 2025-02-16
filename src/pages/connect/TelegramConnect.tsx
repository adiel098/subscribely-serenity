
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const TelegramConnect = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connect Telegram Community</h1>
          <p className="mt-2 text-lg text-gray-600">
            Follow these steps to connect your Telegram community
          </p>
        </div>

        <Card className="p-6 bg-white shadow-sm">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Add our bot to your group</h3>
                <p className="mt-1 text-gray-500">
                  First, add @YourBotName to your Telegram group as an administrator
                </p>
                <Button className="mt-4 bg-blue-500 hover:bg-blue-600">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Add Bot to Group
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Configure group settings</h3>
                <p className="mt-1 text-gray-500">
                  Set up your group's access rules and subscription requirements
                </p>
                <Button className="mt-4" variant="outline" disabled>
                  Configure Settings
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Verify connection</h3>
                <p className="mt-1 text-gray-500">
                  Verify that your group is properly connected and ready to use
                </p>
                <Button className="mt-4" variant="outline" disabled>
                  Verify Connection
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TelegramConnect;
