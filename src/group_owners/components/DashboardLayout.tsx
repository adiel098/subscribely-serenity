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
    <div className="min-h-screen w-full bg-white">
      <GroupOwnerHeader />
      <div className="flex w-full min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] pt-14 md:pt-16">
        {!isMobile ? (
          <AppSidebar />
        ) : (
          <MobileSidebar />
        )}
        <main className="flex-1 w-full">
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
              duration: 0.3
            }}
            className={`p-6 ${!isMobile ? 'pl-[240px]' : ''}`}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

DashboardLayout.displayName = "DashboardLayout";
