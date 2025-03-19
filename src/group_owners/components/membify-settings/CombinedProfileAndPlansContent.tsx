
import React from "react";
import { ProfileTabContent } from "./profile/ProfileTabContent";
import { PlansTabContent } from "./PlansTabContent";
import { Loader2 } from "lucide-react";

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
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <ProfileTabContent 
          profileData={profileData}
          setProfileData={setProfileData}
          isLoading={false} // We're already checking loading state above
          userId={userId}
        />
      </div>
      <div>
        <PlansTabContent />
      </div>
    </div>
  );
};
