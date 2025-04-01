
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
  
  return (
    <div className="p-4 space-y-4">
      <BroadcastStats entityId={entityId} entityType={entityType} />
      
      <div className="space-y-4 mt-6">
        <BroadcastMessageForm entityId={entityId} entityType={entityType} />
      </div>
    </div>
  );
};
