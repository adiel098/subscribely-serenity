
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/auth/contexts/AuthContext";
import { MembifySettingsHeader } from "../components/membify-settings/MembifySettingsHeader";
import { ProfileTabContent } from "../components/membify-settings/profile/ProfileTabContent";
import { PlansTabContent } from "../components/membify-settings/PlansTabContent";
import { PurchaseHistoryTable } from "../components/membify-settings/PurchaseHistoryTable";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const MembifySettings = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className={`p-6 ${isMobile ? 'p-2 pt-3' : 'p-6'} w-full`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MembifySettingsHeader />
        
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-3'} gap-6 ${isMobile ? 'gap-3 mobile-grid-2' : 'gap-6'} mt-6`}>
          {/* Profile Panel */}
          <ProfileTabContent />
          
          {/* Subscription Plan Panel */}
          <PlansTabContent />
          
          {/* Billing Information Panel */}
          <Card className="shadow-md border border-indigo-100">
            <PurchaseHistoryTable />
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default MembifySettings;
