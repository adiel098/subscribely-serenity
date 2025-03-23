
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
import { Send, Loader2, Megaphone } from "lucide-react";
import { motion } from "framer-motion";

interface BroadcastCardProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastCard = ({
  entityId,
  entityType
}: BroadcastCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-indigo-100 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-4 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Megaphone className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-indigo-900">Send Broadcast Message</CardTitle>
              <CardDescription className="text-indigo-700">
                Reach your subscribers with important updates ✉️
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <BroadcastMessageForm 
            entityId={entityId}
            entityType={entityType}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
