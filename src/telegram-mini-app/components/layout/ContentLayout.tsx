
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface ContentLayoutProps {
  children: React.ReactNode;
}

export const ContentLayout: React.FC<ContentLayoutProps> = ({ children }) => {
  return (
    <ScrollArea className="h-[100vh] w-full no-scrollbar">
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-background to-blue-50/30">
        <div className="w-full max-w-full mx-auto px-4 space-y-6 pb-20">
          {children}
          <div className="pb-10"></div>
        </div>
      </div>
    </ScrollArea>
  );
};
