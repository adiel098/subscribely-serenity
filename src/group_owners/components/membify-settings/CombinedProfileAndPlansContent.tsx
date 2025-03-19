import React from "react";
import { ProfileTabContent } from "./profile/ProfileTabContent";
import { PlansTabContent } from "./PlansTabContent";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
interface CombinedProfileAndPlansContentProps {
  profileData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  setProfileData: React.Dispatch<React.SetStateAction<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }>>;
  isLoading: boolean;
  userId: string | undefined;
}
export const CombinedProfileAndPlansContent = ({
  profileData,
  setProfileData,
  isLoading,
  userId
}: CombinedProfileAndPlansContentProps) => {
  if (isLoading) {
    return <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>;
  }
  return;
};