
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/auth/contexts/AuthContext";
import { MembifySettingsHeader } from "../components/membify-settings/MembifySettingsHeader";
import { ProfileTabContent } from "../components/membify-settings/profile/ProfileTabContent";
import { PlansTabContent } from "../components/membify-settings/PlansTabContent";
import { PurchaseHistoryTable } from "../components/membify-settings/PurchaseHistoryTable";
import { MobileOptimizedPurchaseHistory } from "../components/membify-settings/MobileOptimizedPurchaseHistory";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data for the purchase history
const samplePurchases = [
  {
    id: "1",
    date: "2023-06-10",
    amount: 19.99,
    status: "completed" as const,
    method: "Credit Card"
  },
  {
    id: "2",
    date: "2023-05-10",
    amount: 19.99,
    status: "completed" as const,
    method: "PayPal"
  },
  {
    id: "3",
    date: "2023-04-10",
    amount: 19.99,
    status: "completed" as const,
    method: "Credit Card"
  }
];

const MembifySettings = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'p-2 pt-3' : 'p-6'} w-full`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MembifySettingsHeader />
        
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-3'} ${isMobile ? 'gap-3 mobile-grid-2' : 'gap-6'} mt-6`}>
          {/* Profile Panel */}
          <ProfileTabContent />
          
          {/* Subscription Plan Panel */}
          <PlansTabContent />
          
          {/* Billing Information Panel */}
          <Card className="shadow-md border border-indigo-100">
            {isMobile ? (
              <div className="p-3">
                <MobileOptimizedPurchaseHistory purchases={samplePurchases} />
              </div>
            ) : (
              <PurchaseHistoryTable />
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default MembifySettings;
