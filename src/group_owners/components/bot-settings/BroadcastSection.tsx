
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
  const features = [{
    icon: <Users className="h-4 w-4 text-indigo-600" />,
    text: "Target specific member groups"
  }, {
    icon: <Send className="h-4 w-4 text-purple-600" />,
    text: "Include buttons and rich media"
  }, {
    icon: <Clock className="h-4 w-4 text-blue-600" />,
    text: "Track delivery performance"
  }];
  
  return <div className="p-4 space-y-4">
      <div className="space-y-2 mb-6">
        <div className="flex items-center space-x-2">
          <Megaphone className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-indigo-700">Broadcast Messages</h3>
        </div>
        <p className="text-sm text-gray-600">
          Send announcements, updates, and promotional messages to all your subscribers or target specific groups.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center space-x-2 p-3 rounded-lg bg-white border border-gray-200 shadow-sm"
            >
              <div className="bg-gray-50 p-2 rounded-full">{feature.icon}</div>
              <span className="text-sm text-gray-700">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <BroadcastStats entityId={entityId} entityType={entityType} />
      
      <div className="space-y-4 mt-6">
        <BroadcastMessageForm entityId={entityId} entityType={entityType} />
      </div>
    </div>;
};
