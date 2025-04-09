
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const RootLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
