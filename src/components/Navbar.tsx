
import { useLocation } from 'react-router-dom';
import { GroupOwnerHeader } from '@/group_owners/components/GroupOwnerHeader';
import { MainHeader } from '@/components/MainHeader';

const Navbar = () => {
  const location = useLocation();
  
  // Check if the current route is for group owners
  const isGroupOwnerRoute = location.pathname.includes('/dashboard') || 
                            location.pathname.includes('/subscribers') ||
                            location.pathname.includes('/subscriptions') ||
                            location.pathname.includes('/messages') ||
                            location.pathname.includes('/analytics') ||
                            location.pathname.includes('/bot-settings');
  
  // Determine which header to render based on the route
  return isGroupOwnerRoute ? <GroupOwnerHeader /> : <MainHeader />;
};

export default Navbar;
