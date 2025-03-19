
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { MembifySettingsHeader } from "../components/membify-settings/MembifySettingsHeader";
import { ProfileTabContent } from "../components/membify-settings/profile/ProfileTabContent";
import { PlansTabContent } from "../components/membify-settings/PlansTabContent";

const MembifySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user?.email || '',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full space-y-6 py-[5px] px-[14px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MembifySettingsHeader />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl shadow-sm">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="plans" 
              className="flex items-center gap-1.5 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            >
              <CreditCard className="h-4 w-4" />
              <span>Plans</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTabContent 
              profileData={profileData}
              setProfileData={setProfileData}
              isLoading={isLoading}
              userId={user?.id}
            />
          </TabsContent>

          <TabsContent value="plans">
            <PlansTabContent />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default MembifySettings;
