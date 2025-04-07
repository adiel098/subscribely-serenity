
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export const MembifySettingsHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-6'}`}>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/dashboard")}
          className="h-8 w-8 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
          Membify Settings
        </h1>
      </div>
      <div className="flex-shrink-0">
        <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
          <Settings className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  );
};
