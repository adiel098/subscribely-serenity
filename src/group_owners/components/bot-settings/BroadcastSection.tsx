
import React from "react";
import { Megaphone, Users, Send, Clock } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
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
    <AccordionItem value="broadcast" className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <AccordionTrigger className="px-4 py-4 hover:bg-indigo-50/50 transition-colors">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-red-50 to-amber-50 p-2 rounded-full">
            <Megaphone className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-left">
            <span className="font-medium">Broadcast Messages</span>
            <p className="text-xs text-muted-foreground">Send announcements to members</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-6 bg-gradient-to-b from-white to-indigo-50/20">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-amber-50 to-red-50 p-3 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-800">
                Send broadcast messages to all subscribers or specific groups. Keep your community engaged with important updates! 📢
              </p>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
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
            <Card className="border border-indigo-100">
              <CardContent className="pt-6">
                <BroadcastMessageForm 
                  entityId={entityId} 
                  entityType={entityType} 
                />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AccordionContent>
    </AccordionItem>
  );
};
