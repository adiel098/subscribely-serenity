
import { CommunitySelector } from "@/group_owners/components/CommunitySelector";
import { AppSidebar } from "@/group_owners/components/AppSidebar";
import { GroupOwnerHeader } from "@/group_owners/components/GroupOwnerHeader";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileSidebar } from "@/group_owners/components/mobile/MobileSidebar";

export const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <GroupOwnerHeader />
      <div className="flex w-full h-[calc(100vh-64px)]">
        {!isMobile ? (
          <AppSidebar />
        ) : (
          <MobileSidebar />
        )}
        <main className="flex-1 overflow-auto w-full">
          <CommunitySelector />
          <motion.div 
            initial={{
              opacity: 0,
              y: 10
            }} 
            animate={{
              opacity: 1,
              y: 0
            }} 
            transition={{
              duration: 0.4,
              delay: 0.2
            }} 
            className={`p-1 sm:p-2 ${isMobile ? 'mt-[120px] max-w-[100vw]' : 'mt-[140px] ml-[240px] w-[calc(100vw-260px)]'}`}
          >
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden w-full">
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
