
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/group_owners/components/AppSidebar";
import { CommunitySelector } from "@/group_owners/components/CommunitySelector";
import { motion } from "framer-motion";

export const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] mt-16">
          <CommunitySelector />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="min-h-full w-full px-6 py-8 mt-[4.5rem] pl-[280px]"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
