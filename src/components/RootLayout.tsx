import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const RootLayout = () => {
  const location = useLocation();
  
  // Don't render Navbar on routes that have their own navigation
  const skipNavbarRoutes = [
    '/projects/new',
    '/projects/settings',
    '/connect/telegram',
    '/telegram-mini-app',
    '/dashboard',        // תוספת - דף הדאשבורד כבר מכיל header
    '/subscribers',      // תוספת - דף המנויים כבר מכיל header
    '/subscriptions',    // תוספת - דף מסלולים כבר מכיל header 
    '/payment-methods',  // תוספת - דף תשלומים כבר מכיל header
    '/bot-settings',     // תוספת - דף הגדרות בוט כבר מכיל header
    '/membify-settings', // תוספת - דף הגדרות פלטפורמה כבר מכיל header
    '/messages',         // תוספת - דף הודעות כבר מכיל header
    '/discount-coupons'  // תוספת - דף קופונים כבר מכיל header
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
