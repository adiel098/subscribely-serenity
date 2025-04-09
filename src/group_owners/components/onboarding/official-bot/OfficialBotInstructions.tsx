
import React from "react";
import { Card } from "@/components/ui/card";
import { Shield, MessageSquare } from "lucide-react";

export const OfficialBotInstructions: React.FC = () => {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-md border border-indigo-50 rounded-xl">
      <div className="flex items-start space-x-4">
        <div className="bg-indigo-100 p-2.5 rounded-full">
          <Shield className="h-5 w-5 text-indigo-600" />
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Benefits of the Membify Official Bot</h3>
            <p className="mt-1 text-sm text-gray-600">
              The official Membify bot offers enhanced features and reliability for your Telegram communities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-green-100 p-1.5 rounded-full">
                <MessageSquare className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Automatic User Management</h4>
                <p className="mt-1 text-xs text-gray-600">
                  Seamlessly handles user access based on subscription status
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-green-100 p-1.5 rounded-full">
                <MessageSquare className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enhanced Security</h4>
                <p className="mt-1 text-xs text-gray-600">
                  Keeps your communities safe with spam detection
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-green-100 p-1.5 rounded-full">
                <MessageSquare className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Payment Tracking</h4>
                <p className="mt-1 text-xs text-gray-600">
                  Monitors subscription payments and sends renewal reminders
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 bg-green-100 p-1.5 rounded-full">
                <MessageSquare className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">24/7 Support</h4>
                <p className="mt-1 text-xs text-gray-600">
                  Get assistance whenever you need it from our support team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
