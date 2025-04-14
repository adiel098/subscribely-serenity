import { useLocation } from 'react-router-dom';
import { MainHeader } from '@/components/MainHeader';

const Navbar = () => {
  const location = useLocation();
  
  // Check if the current route is for group owners
  const isGroupOwnerRoute = location.pathname.includes('/dashboard') || 
                            location.pathname.includes('/subscribers') ||
                            location.pathname.includes('/subscriptions') ||
                            location.pathname.includes('/messages') ||
                            location.pathname.includes('/bot-settings');
  
  // בדפי המנהל אנחנו לא מציגים את ה-header כאן,
  // כי הוא כבר מוצג בתוך ה-DashboardLayout
  return !isGroupOwnerRoute ? <MainHeader /> : null;
};

export default Navbar;
