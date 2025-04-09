
import { useNavigate } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Bot, 
  MessageSquare 
} from 'lucide-react';

type MobileSidebarProps = {
  onClose: () => void;
};

export const MobileSidebar = ({ onClose }: MobileSidebarProps) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    { icon: <LayoutDashboard className="h-4 w-4 mr-3" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users className="h-4 w-4 mr-3" />, label: 'Subscribers', path: '/subscribers' },
    { icon: <CreditCard className="h-4 w-4 mr-3" />, label: 'Subscriptions', path: '/subscriptions' },
    { icon: <MessageSquare className="h-4 w-4 mr-3" />, label: 'Messages', path: '/messages' },
    { icon: <Bot className="h-4 w-4 mr-3" />, label: 'Bot Settings', path: '/bot-settings' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="py-2 px-3">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className="w-full justify-start mb-1"
            onClick={() => handleNavigation(item.path)}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
