
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
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <GroupOwnerHeader />
      <div className="flex w-full h-[calc(100vh-64px)]">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <CommunitySelector />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="p-4 mt-[140px] ml-[240px] max-w-[calc(100vw-260px)]"
          >
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 overflow-auto">
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
