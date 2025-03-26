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
    <div className="h-screen w-full bg-white overflow-hidden">
      <GroupOwnerHeader />
      <div className="flex w-full h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] pt-14 md:pt-16">
        {!isMobile ? (
          <AppSidebar />
        ) : (
          <MobileSidebar />
        )}
        <main className="flex-1 overflow-auto w-full">
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
            className={`w-full ${!isMobile && 'pl-[240px] pr-6'}`}
          >
            <div className="bg-white w-full p-3 md:p-4">
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
