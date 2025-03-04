
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="min-h-full w-full px-6 py-8 mt-[4.5rem] ml-6"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              {children}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};
