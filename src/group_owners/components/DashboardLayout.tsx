
import { CommunitySelector } from "@/group_owners/components/CommunitySelector";
import { AppSidebar } from "@/group_owners/components/AppSidebar";
import { GroupOwnerHeader } from "@/group_owners/components/GroupOwnerHeader";
import { motion } from "framer-motion";

export const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50">
      <GroupOwnerHeader />
      <div className="flex w-full pt-16">
        <AppSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <CommunitySelector />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="min-h-full w-full px-6 py-8 mt-[4.5rem] ml-[280px]"
          >
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
