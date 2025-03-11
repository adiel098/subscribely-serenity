
import React from "react";
import { Sparkles } from "lucide-react";

export const PlatformPlansHeader = () => {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center justify-center gap-2 mb-3 px-4 py-1.5 bg-indigo-50 rounded-full">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-medium text-indigo-600">Choose Your Plan</span>
      </div>
      <h1 className="text-3xl font-bold mb-3 text-gray-900 bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
        Platform Subscription Plans
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Choose the right plan to manage your Telegram communities efficiently and maximize your revenue
      </p>
    </div>
  );
};
