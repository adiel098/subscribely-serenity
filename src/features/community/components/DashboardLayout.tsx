
import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { CommunitySelector } from "@/components/CommunitySelector";
import { useLocation } from "react-router-dom";

export const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return <div className="min-h-screen w-full">
      <Navbar />
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] mt-16">
          {!isAdminPage && <CommunitySelector />}
          <div className={`min-h-full w-full bg-gray-50 px-6 py-8 mt-${isAdminPage ? '16' : '[4.5rem]'} pl-[280px]`}>
            {children}
          </div>
        </main>
      </div>
    </div>;
};
