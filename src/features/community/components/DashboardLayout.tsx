
import { useLocation } from "react-router-dom";
import Navbar from "@/features/community/components/Navbar";
import { AppSidebar } from "@/features/community/components/AppSidebar";
import { CommunitySelector } from "@/features/community/components/CommunitySelector";

export const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <AppSidebar />
        <main className="flex-1 relative mt-16">
          {!isAdminPage && <CommunitySelector />}
          <div className={`${!isAdminPage ? 'mt-[4.5rem]' : ''} h-[calc(100vh-8.5rem)] overflow-y-auto pl-[280px]`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
