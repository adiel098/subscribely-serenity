
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
  
  return (
    <Card className="h-full shadow-md border border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
        <CardTitle className="text-xl text-indigo-700">
          Combined View ✨
        </CardTitle>
        <CardDescription className="text-indigo-500">
          Profile and Plans overview
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
            <h3 className="font-medium text-indigo-700 mb-2">Profile Summary</h3>
            <div className="bg-white p-3 rounded-md">
              <p className="text-sm"><span className="font-medium">Name:</span> {profileData.first_name} {profileData.last_name}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {profileData.email}</p>
              <p className="text-sm"><span className="font-medium">Phone:</span> {profileData.phone || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <h3 className="font-medium text-blue-700 mb-2">Active Plan</h3>
            <div className="bg-white p-3 rounded-md">
              <p className="text-sm">Your subscription details appear here</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
