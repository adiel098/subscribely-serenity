
import { motion } from 'framer-motion';
import { Sidebar } from "@/components/ui/sidebar";
import { AppSidebarContent } from './AppSidebarContent';
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`fixed left-2 top-[80px] h-[calc(100vh-88px)] z-30 ${isMobile ? 'hidden' : ''}`}
    >
      <Sidebar className="w-[220px] rounded-xl border border-blue-100 shadow-lg bg-white/95 backdrop-blur-md">
        <AppSidebarContent />
      </Sidebar>
    </motion.div>
  );
}
