import Navbar from "@/components/Navbar";
import { AppSidebar } from "@/group_owners/components/AppSidebar";
import { CommunitySelector } from "@/group_owners/components/CommunitySelector";

export const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return <div className="min-h-screen w-full">
      <Navbar />
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] mt-16">
          <CommunitySelector />
          <div className="min-h-full w-full bg-gray-50 px-6 py-8 mt-[4.5rem] pl-[280px]">
            {children}
          </div>
        </main>
      </div>
    </div>;
};
