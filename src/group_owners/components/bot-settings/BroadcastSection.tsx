
import React from "react";
import { Megaphone, Users, Send, Clock } from "lucide-react";
import { BroadcastStats } from "./broadcast/BroadcastStats";
import { BroadcastMessageForm } from "./broadcast/BroadcastMessageForm";
import { motion } from "framer-motion";

interface BroadcastSectionProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastSection = ({ 
  entityId, 
  entityType 
}: BroadcastSectionProps) => {
  const features = [
    { 
      icon: <Users className="h-4 w-4 text-indigo-600" />, 
      text: "Target specific member groups" 
    },
    { 
      icon: <Send className="h-4 w-4 text-purple-600" />, 
      text: "Include buttons and rich media" 
    },
    { 
      icon: <Clock className="h-4 w-4 text-blue-600" />, 
      text: "Track delivery performance" 
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="bg-gradient-to-r from-amber-50 to-red-50 p-3 rounded-lg border border-amber-100">
          <p className="text-sm text-amber-800">
            Send broadcast messages to all subscribers or specific groups. Keep your community engaged with important updates! 📢
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 bg-white/80 p-2 rounded-md">
                <div className="bg-gray-50 p-1.5 rounded-full">
                  {feature.icon}
                </div>
                <span className="text-xs font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <BroadcastStats entityId={entityId} entityType={entityType} />
      
      <div className="space-y-4">
        <BroadcastMessageForm 
          entityId={entityId} 
          entityType={entityType} 
        />
      </div>
    </div>
  );
};
