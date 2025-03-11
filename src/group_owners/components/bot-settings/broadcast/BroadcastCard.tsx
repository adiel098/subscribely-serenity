
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FilterTypeSelector } from "./FilterTypeSelector";
import { BroadcastMessageForm } from "./BroadcastMessageForm";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface BroadcastCardProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastCard = ({
  entityId,
  entityType
}: BroadcastCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Broadcast Message</CardTitle>
        <CardDescription>
          Send a message to your subscribers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <BroadcastMessageForm 
          entityId={entityId}
          entityType={entityType}
        />
      </CardContent>
    </Card>
  );
};
