
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

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  
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
        <DrawerContent className="h-[85vh] p-0" data-drawer-content>
          <DrawerHeader className="border-b border-gray-100 py-4">
            <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Menu
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-0 overflow-auto h-full">
            <AppSidebarContent isMobile={true} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
