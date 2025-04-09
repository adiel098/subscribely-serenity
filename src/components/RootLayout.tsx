
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const RootLayout = () => {
  const location = useLocation();
  
  // Don't render Navbar on routes that have their own navigation
  const skipNavbarRoutes = [
    '/projects/new',
    '/projects/settings',
    '/connect/telegram',
    '/telegram-mini-app'
  ];
  
  const shouldRenderNavbar = !skipNavbarRoutes.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  return (
    <div className="min-h-screen">
      {shouldRenderNavbar && <Navbar />}
      <main className={shouldRenderNavbar ? "pt-16" : ""}>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
