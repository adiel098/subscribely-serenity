import { useEffect, useState } from 'react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AppSidebarContent } from '../AppSidebarContent';
import { useLocation } from 'react-router-dom';

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  
  // Close the drawer when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-drawer-content]') && !target.closest('[data-drawer-trigger]')) {
        setOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  // Close the drawer when navigating to a new page
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button 
            data-drawer-trigger
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-white border-blue-100"
          >
            <Menu className="h-6 w-6 text-blue-600" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-auto p-0" data-drawer-content>
          <DrawerHeader className="border-b border-gray-100 py-4">
            <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Membify
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-0">
            <AppSidebarContent isMobile={true} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
