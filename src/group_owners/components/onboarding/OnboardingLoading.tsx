
import React from "react";
import { Loader2 } from "lucide-react";

export const OnboardingLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
  </div>
);
