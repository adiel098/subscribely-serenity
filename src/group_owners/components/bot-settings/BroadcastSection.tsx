import React, { useState } from "react";
import { Megaphone } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { BroadcastStats } from "./broadcast/BroadcastStats";
import { BroadcastMessageForm } from "./broadcast/BroadcastMessageForm";

interface BroadcastSectionProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastSection = ({ 
  entityId, 
  entityType 
}: BroadcastSectionProps) => {
  return (
    <AccordionItem value="broadcast" className="border rounded-lg">
      <AccordionTrigger className="px-4">
        <div className="flex items-center space-x-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <span>Broadcast Messages</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Send broadcast messages to all subscribers or specific groups.
            </p>
          </div>
          
          <BroadcastStats entityId={entityId} entityType={entityType} />
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <BroadcastMessageForm 
                  entityId={entityId} 
                  entityType={entityType} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
